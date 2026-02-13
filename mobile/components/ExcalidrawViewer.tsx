import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface ExcalidrawViewerProps {
    initialElements: any[];
    onSelectElement: (elementId: string | null) => void;
}

const EXCALIDRAW_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Excalidraw Viewer</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/excalidraw.production.min.js"></script>
    <style>
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      #app { width: 100%; height: 100%; }
      /* Hide some Excalidraw UI elements usually not needed for viewing/booking */
      .App-menu__left, .App-top-bar, .layer-ui__wrapper__footer-left, .layer-ui__wrapper__footer-right, .layer-ui__wrapper__top-right {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      const { useState, useEffect, createElement } = React;
      const { Excalidraw } = ExcalidrawLib;

      const App = () => {
        const [excalidrawAPI, setExcalidrawAPI] = useState(null);
        
        // Initial data injected via window.initialData
        const initialData = window.initialData || { elements: [], appState: { viewModeEnabled: true } };

        useEffect(() => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "READY" }));
          }

          // Listen for messages from RN
          const handleRNMessage = (event) => {
             // In WebView, message from RN is usually triggered via evaluating JS or custom event? 
             // React Native WebView's injectJavaScript or postMessage is different. 
             // The standard way is document.addEventListener("message") (iOS) or document.addEventListener("message") (Android)
             // But actually, we will wrap the message listener in the main script, not inside the React component efficiently unless we expose a global function.
          };
        }, []);

        // Expose update function globally
        window.updateScene = (elements) => {
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({ elements });
          }
        };

        const onChange = (elements, appState, files) => {
           // Detect selection change - standard Excalidraw behavior
           const selectedIds = Object.keys(appState.selectedElementIds || {});
           if (window.ReactNativeWebView && selectedIds.length > 0) {
             const selectedId = selectedIds[0];
             window.ReactNativeWebView.postMessage(JSON.stringify({ 
               type: "SELECTION_CHANGE", 
               payload: selectedId 
             }));
             // Clear selection immediately so it acts like a button? 
             // Or keep it? If we keep it, we need to sync with RN state.
             // Let's clear it to allow re-clicking easily if needed, or let RN handle visual state.
             // For "booking", usually we want the visual state (color) to change, handled by RN sending back new elements.
             // So we can clear the specialized Excalidraw selection box.
             excalidrawAPI.updateScene({ appState: { selectedElementIds: {} } });
           }
        };

        return createElement(Excalidraw, {
          initialData: initialData,
          viewModeEnabled: true,
          zenModeEnabled: true,
          gridModeEnabled: false,
          onChange: onChange,
          excalidrawAPI: (api) => setExcalidrawAPI(api)
        });
      };

      const root = ReactDOM.createRoot(document.getElementById("app"));
      root.render(createElement(App));
    </script>
  </body>
</html>
`;

export const ExcalidrawViewer: React.FC<ExcalidrawViewerProps> = ({
    initialElements,
    onSelectElement,
}) => {
    const webViewRef = useRef<WebView>(null);

    // Inject initial data
    // We use a safe way to inject data by replacing a placeholder or just using injectedJavaScriptBeforeContentLoaded
    // However, initialElements might be large, so passing it via a variable assignment in JS is better.
    const runFirst = `
    window.initialData = {
      elements: ${JSON.stringify(initialElements)},
      appState: { viewModeEnabled: true, zoom: { value: 1 } }
    };
    true;
  `;

    // Send updates when elements change
    useEffect(() => {
        if (webViewRef.current) {
            // We only want to update elements, not appState usually
            const script = `
             if (window.updateScene) {
               window.updateScene(${JSON.stringify(initialElements)});
             }
          `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [initialElements]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "SELECTION_CHANGE") {
                onSelectElement(data.payload);
            } else if (data.type === "READY") {
                console.log("Excalidraw WebView Ready");
            }
        } catch (e) {
            console.error("Error parsing message from WebView", e);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: EXCALIDRAW_HTML }}
                injectedJavaScriptBeforeContentLoaded={runFirst}
                onMessage={handleMessage}
                style={styles.webview}
                scrollEnabled={false}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
    },
    loading: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
});
