import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface InvitationModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeSubmit: (code: string) => void;
  isProcessing?: boolean;
}

const InvitationModal = ({
  visible,
  onClose,
  onCodeSubmit,
  isProcessing = false,
}: InvitationModalProps) => {
  const [invitationCode, setInvitationCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowScanner(false);
      setInvitationCode("");
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setInvitationCode(data);
    setShowScanner(false);
    Alert.alert("Code scanné", `Code d'invitation: ${data}`, [
      { text: "OK", onPress: () => {} },
    ]);
  };

  const handleOpenScanner = async () => {
    if (!permission) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission requise",
          "L'accès à la caméra est nécessaire pour scanner le QR code."
        );
        return;
      }
    } else if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission requise",
          "L'accès à la caméra est nécessaire pour scanner le QR code."
        );
        return;
      }
    }
    setShowScanner(true);
    setScanned(false);
  };

  const handleSubmit = () => {
    if (!invitationCode.trim()) {
      Alert.alert("Erreur", "Veuillez entrer ou scanner un code d'invitation");
      return;
    }
    onCodeSubmit(invitationCode.trim());
  };

  if (showScanner && permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13"],
            }}
          />
          {/* Overlay avec positionnement absolu */}
          <View className="absolute inset-0">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 pt-12">
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                className="bg-black/50 rounded-full p-3"
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">Scanner QR Code</Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Scanner Area */}
            <View className="flex-1 items-center justify-center">
              <View className="w-64 h-64 border-4 border-primary rounded-2xl" />
              <Text className="text-white mt-6 text-center px-6">
                Positionnez le QR code dans le cadre
              </Text>
            </View>

            {/* Footer */}
            <View className="pb-12 items-center">
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                className="bg-surface rounded-full px-6 py-3"
              >
                <Text className="text-text-primary font-semibold">Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl" style={{ height: "90%" }}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-surface">
            <View>
              <Text className="text-text-primary text-2xl font-bold">Code d'invitation</Text>
              <Text className="text-text-secondary text-sm mt-1">
                Pour événements privés (mariage, etc.)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-surface rounded-full p-2">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Manual Code Input */}
            <View className="mb-6">
              <Text className="text-text-primary text-base font-semibold mb-3">
                Entrer le code manuellement
              </Text>
              <View className="bg-surface rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="keypad-outline" size={22} color="#666" />
                <TextInput
                  placeholder="Ex: WEDDING2024"
                  placeholderTextColor={"#666"}
                  className="flex-1 ml-3 text-base text-text-primary"
                  value={invitationCode}
                  onChangeText={setInvitationCode}
                  autoCapitalize="characters"
                  editable={!isProcessing}
                />
              </View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-surface" />
              <Text className="mx-4 text-text-secondary text-sm">OU</Text>
              <View className="flex-1 h-px bg-surface" />
            </View>

            {/* QR Scanner Button */}
            <TouchableOpacity
              onPress={handleOpenScanner}
              className="bg-surface rounded-2xl p-5 flex-row items-center justify-center mb-6"
              disabled={isProcessing}
            >
              <Ionicons name="qr-code-outline" size={28} color="#1DB954" />
              <Text className="text-text-primary font-semibold text-lg ml-3">
                Scanner QR Code
              </Text>
            </TouchableOpacity>

            {/* Info */}
            <View className="bg-primary/10 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle-outline" size={20} color="#1DB954" />
                <View className="ml-3 flex-1">
                  <Text className="text-text-primary text-sm font-semibold mb-1">
                    Comment ça fonctionne ?
                  </Text>
                  <Text className="text-text-secondary text-xs leading-5">
                    Pour accéder à un événement privé, vous devez avoir reçu un code d'invitation
                    ou un QR code. Scannez le QR code ou entrez le code manuellement.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="p-6 border-t border-surface">
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-primary rounded-2xl py-4 flex-row items-center justify-center"
              disabled={isProcessing || !invitationCode.trim()}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <>
                  <Text className="text-background font-bold text-lg mr-2">Valider</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#121212" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InvitationModal;

