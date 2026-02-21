import { Image } from "expo-image";
import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    Gesture,
    GestureDetector
} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";

interface FloorPlanElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    name: string;
    imageSource?: string;
    price?: string;
    available?: boolean;
}

interface InteractiveFloorPlanProps {
    elements: FloorPlanElement[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    availableIds?: string[];
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Sub-component for individual element animation
const AnimatedElement = ({
    el,
    isSelected,
    isAvailable,
    isBackground,
    badgeRotation,
    onSelect,
    rotationData
}: {
    el: FloorPlanElement,
    isSelected: boolean,
    isAvailable: boolean,
    isBackground: boolean,
    badgeRotation: number,
    onSelect: (id: string) => void,
    rotationData: any
}) => {
    const scaleValue = useSharedValue(1);

    useEffect(() => {
        if (isSelected) {
            // Pulse animation when selected
            scaleValue.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                -1, // Infinite
                true // Reverse
            );
        } else {
            scaleValue.value = withSpring(1);
        }
    }, [isSelected]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${(el.angle * 180) / Math.PI}deg` },
            { scale: scaleValue.value }
        ],
        zIndex: isBackground ? 0 : isSelected ? 10 : 1
    }));

    if (el.type !== 'image' || !el.imageSource) return null;

    return (
        <Animated.View
            style={[
                styles.elementWrapper,
                {
                    left: el.x - (rotationData.minX || 0),
                    top: el.y - (rotationData.minY || 0),
                    width: el.width,
                    height: el.height,
                },
                animatedStyle
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => !isBackground && onSelect(el.id)}
                disabled={isBackground || !isAvailable}
                style={[
                    styles.touchable,
                    isSelected && styles.selectedElement,
                    !isAvailable && !isBackground && styles.unavailableElement
                ]}
            >
                <Image
                    source={{ uri: el.imageSource }}
                    style={styles.image}
                    contentFit="contain"
                />
                {!isBackground && el.name !== "Image" && (
                    <View style={[styles.badge, { transform: [{ rotate: `${badgeRotation}deg` }] }]}>
                        <Text style={styles.badgeText}>{el.name}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
    elements,
    selectedIds,
    onSelect,
    availableIds = [],
}) => {
    // Calculate bounding box and check for auto-rotation
    const rotationData = useMemo(() => {
        if (elements.length === 0) return { minX: 0, minY: 0, width: 0, height: 0, needsRotation: false };

        let minX = elements[0].x;
        let minY = elements[0].y;
        let maxX = elements[0].x + elements[0].width;
        let maxY = elements[0].y + elements[0].height;

        elements.forEach(el => {
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + el.width);
            maxY = Math.max(maxY, el.y + el.height);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        // Auto-rotation logic: if plan is landscape but screen is portrait, rotate it
        const planIsLandscape = width > height;
        const screenIsPortrait = WINDOW_HEIGHT > WINDOW_WIDTH;
        const needsRotation = planIsLandscape && screenIsPortrait;

        return { minX, minY, maxX, maxY, width, height, needsRotation };
    }, [elements]);

    const initialScale = useMemo(() => {
        const { width, height, needsRotation } = rotationData;
        if (!width || !height) return 1;

        const targetWidth = needsRotation ? height : width;
        const targetHeight = needsRotation ? width : height;

        return Math.min(WINDOW_WIDTH / targetWidth, (WINDOW_HEIGHT - 100) / targetHeight) * 0.95;
    }, [rotationData]);

    // Pan and Zoom states
    const scale = useSharedValue(initialScale);
    const savedScale = useSharedValue(initialScale);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const resetView = () => {
        "worklet";
        scale.value = withSpring(initialScale);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = initialScale;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    // Zoom Gesture
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            // Use a relative scale that can go down to 50% of original fit
            const minScale = initialScale * 0.5;
            const maxScale = initialScale * 15;
            scale.value = clamp(savedScale.value * e.scale, minScale, maxScale);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    // Pan Gesture
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    // Double tap to reset
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            resetView();
        });

    const composedGesture = Gesture.Simultaneous(
        doubleTap,
        pinchGesture,
        panGesture
    );

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotate: rotationData.needsRotation ? '90deg' : '0deg' }
        ],
    }));

    // Minimap calculation
    const minimapScale = useMemo(() => {
        const padding = 10;
        const availableSpace = 80 - padding;
        return Math.min(availableSpace / rotationData.width, availableSpace / rotationData.height);
    }, [rotationData]);

    const viewportStyle = useAnimatedStyle(() => {
        const vWidth = WINDOW_WIDTH / scale.value;
        const vHeight = WINDOW_HEIGHT / scale.value;

        return {
            width: vWidth,
            height: vHeight,
            transform: [
                { scale: minimapScale },
                { translateX: -translateX.value / scale.value },
                { translateY: -translateY.value / scale.value },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={composedGesture}>
                <Animated.View style={[styles.planContainer, containerStyle]}>
                    <View style={{
                        width: rotationData.width || WINDOW_WIDTH,
                        height: rotationData.height || WINDOW_HEIGHT,
                        position: 'relative',
                    }}>
                        {elements.map((el) => {
                            const isSelected = selectedIds.includes(el.id);
                            const isAvailable = availableIds.length === 0 || availableIds.includes(el.id);
                            const isBackground = el.name === "Miason";
                            const badgeRotation = rotationData.needsRotation ? -90 : 0;

                            return (
                                <AnimatedElement
                                    key={el.id}
                                    el={el}
                                    isSelected={isSelected}
                                    isAvailable={isAvailable}
                                    isBackground={isBackground}
                                    badgeRotation={badgeRotation}
                                    onSelect={onSelect}
                                    rotationData={rotationData}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </GestureDetector>

            {/* MINIMAP INDICATOR */}
            <View style={styles.minimapContainer} pointerEvents="none">
                <View style={[
                    styles.minimapWrapper,
                    { transform: [{ rotate: rotationData.needsRotation ? '90deg' : '0deg' }] }
                ]}>
                    {/* Render simplified elements in minimap for better context */}
                    <View style={{
                        width: rotationData.width * minimapScale,
                        height: rotationData.height * minimapScale,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        position: 'relative'
                    }}>
                        {elements.map(el => (
                            <View
                                key={`mini-${el.id}`}
                                style={{
                                    position: 'absolute',
                                    left: (el.x - rotationData.minX) * minimapScale,
                                    top: (el.y - rotationData.minY) * minimapScale,
                                    width: el.width * minimapScale,
                                    height: el.height * minimapScale,
                                    backgroundColor: el.name === "Miason" ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                                    borderRadius: 1,
                                    transform: [{ rotate: `${(el.angle * 180) / Math.PI}deg` }]
                                }}
                            />
                        ))}
                    </View>

                    {/* Viewport indicator */}
                    <Animated.View style={[styles.viewportIndicator, viewportStyle]} />
                </View>
                <Text style={styles.minimapText}>Vue d'ensemble</Text>
            </View>
        </View>
    );
};

// Helper clamp function
function clamp(val: number, min: number, max: number) {
    "worklet";
    return Math.min(Math.max(val, min), max);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        overflow: 'hidden',
    },
    planContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    elementWrapper: {
        position: "absolute",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    selectedElement: {
        borderWidth: 3,
        borderColor: "#1DB954",
        borderRadius: 8,
        backgroundColor: "rgba(29, 185, 84, 0.4)",
    },
    touchable: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    unavailableElement: {
        opacity: 0.3,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    badge: {
        position: 'absolute',
        bottom: -15,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    minimapContainer: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        alignItems: 'center',
    },
    minimapWrapper: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    minimapText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 8,
        marginTop: 4,
    },
    viewportIndicator: {
        borderWidth: 2,
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        position: 'absolute',
    }
});
