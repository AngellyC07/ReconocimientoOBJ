"use client"

import axios from 'axios'; // Importa la librería axios para hacer peticiones HTTP
import * as ImagePicker from "expo-image-picker"; // Importa la librería de Expo para seleccionar imágenes
import { router } from "expo-router"; // Importa el router de Expo para la navegación
import * as Speech from "expo-speech"; // Importa la librería de Expo para la síntesis de voz
import { useEffect, useState } from "react"; // Importa hooks de React para la gestión del estado y efectos
import { Alert, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"; // Importa componentes y módulos de React Native

export default function GalleryScreen() {
  // Estados para la gestión de la interfaz de usuario y los datos
  const [selectedImage, setSelectedImage] = useState(null); // Estado para almacenar la URI de la imagen seleccionada
  const [showObjectInfo, setShowObjectInfo] = useState(false); // Estado para controlar la visibilidad del modal de información del objeto
  const [predictionResult, setPredictionResult] = useState(null); // Estado para almacenar el resultado de la predicción de la API
  const [objectDescription, setObjectDescription] = useState("Descripción no disponible."); // Estado para almacenar la descripción del objeto detectado

  // Diccionario de clases que mapea los IDs de predicción a nombres y descripciones de objetos
  const classLabels = {
    0: {"nombre": "Microscopio óptico avanzado", "descripcion": "Permite observar muestras pequeñas con luz y lentes."},
    1: {"nombre": "Agitador magnético con placa calefactora", "descripcion": "Mezcla y calienta líquidos en laboratorios."},
    2: {"nombre": "Aire acondicionado YORK", "descripcion": "Regula temperatura y aire en espacios cerrados."},
    3: {"nombre": "Cafetera", "descripcion": "Prepara café automáticamente con agua caliente."},
    4: {"nombre": "Computador", "descripcion": "Procesa información y ejecuta programas."},
    5: {"nombre": "Control remoto de robot", "descripcion": "Permite manejar un robot a distancia."},
    6: {"nombre": "Control remoto de Smart TV", "descripcion": "Mando para controlar funciones del televisor."},
    7: {"nombre": "Estación de soldadura por aire caliente", "descripcion": "Para soldar componentes con aire caliente."},
    8: {"nombre": "Impresora 3D Creality K1 Max", "descripcion": "Crea objetos 3D a partir de diseños digitales."},
    9: {"nombre": "Mini fresadora CNC", "descripcion": "Corta o talla materiales controlada por computadora."},
    10: {"nombre": "Mouse", "descripcion": "Dispositivo para interactuar con la computadora."},
    11: {"nombre": "Osciloscopio digital Rigol DS1202ZE", "descripcion": "Visualiza señales eléctricas como ondas."},
    12: {"nombre": "Puerta", "descripcion": "Permite o restringe el acceso a espacios."},
    13: {"nombre": "Robot humanoide AULER", "descripcion": "Robot con forma y movimientos similares a un humano."},
    14: {"nombre": "Robot LEGO Mindstorms EV3", "descripcion": "Kit educativo para construir y programar robots."},
    15: {"nombre": "Router", "descripcion": "Distribuye internet a múltiples dispositivos."},
    16: {"nombre": "Sensor de suelo integrado", "descripcion": "Mide humedad y temperatura del suelo."},
    17: {"nombre": "Tablet", "descripcion": "Dispositivo táctil portátil con múltiples funciones."},
    18: {"nombre": "Tomacorrientes 110V", "descripcion": "Permite conectar aparatos a la red eléctrica."},
    19: {"nombre": "UPS Netio", "descripcion": "Suministro de energía en caso de cortes eléctricos."}
  };

  // Función para reproducir texto por voz
  const speakText = (text) => {
    Speech.speak(text, {
      language: "es",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // Función para vibrar el dispositivo
  const vibrateDevice = () => {
    Vibration.vibrate(100);
  };

  // Efecto que se ejecuta al cargar la pantalla para dar un mensaje de bienvenida por voz
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText("Selecciona una foto con el objeto para identificar");
    }, 500);

    // Función de limpieza del efecto: cancela el timeout y detiene la síntesis de voz si el componente se desmonta
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente

  // Función asíncrona para enviar la imagen seleccionada al backend para la predicción
  const sendToBackend = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Error", "URI de la imagen no disponible.");
      return;
    }

    const apiUrl = 'http://172.200.240.238:8080/predict/'; // URL de la API para la predicción
    const formData = new FormData(); // Crea un objeto FormData para enviar archivos

    // Añade la imagen al FormData
    formData.append('file', {
      uri: imageUri,
      name: 'gallery_photo.jpg',
      type: 'image/jpeg',
    });

    try {
      // Realiza una petición POST a la API con la imagen
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Respuesta del backend (Galería):", response.data);
      // Si la API devuelve detecciones, actualiza el estado con el primer resultado
      if (response.data && response.data.detections && response.data.detections.length > 0) {
        setPredictionResult(response.data.detections[0]);
        speakText(`Se detectó ${response.data.detections[0]?.nombre} con una confianza de ${(response.data.detections[0]?.confidence * 100).toFixed(2)} por ciento.`);
      } else {
        speakText("No se detectó ningún objeto en la imagen.");
        setPredictionResult(null);
      }
    } catch (error) {
      console.error("Error al enviar la imagen al backend (Galería):", error);
      Alert.alert("Error", "No se pudo contactar al servidor. Asegúrate de que la IP y el puerto sean correctos y el servidor esté funcionando.");
      speakText("Error al contactar al servidor desde galería.");
      setPredictionResult(null);
    }
  };

  // Función asíncrona para abrir la galería y seleccionar una imagen
  const pickImage = async () => {
    vibrateDevice();
    speakText("Abriendo galería");

    // Solicita permisos para acceder a la galería de medios
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Si no se conceden los permisos, muestra una alerta
    if (permissionResult.granted === false) {
      Alert.alert("Permisos necesarios", "Necesitamos acceso a tu galería para seleccionar fotos", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Configuración",
          onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
        },
      ]);
      return;
    }

    // Abre la galería de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    // Si el usuario no cancela la selección, actualiza el estado con la imagen seleccionada y la envía al backend
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      sendToBackend(result.assets[0].uri);
    }
  };

  // Función para permitir al usuario seleccionar otra imagen, reiniciando los estados relacionados con la predicción
  const selectAnotherImage = () => {
    vibrateDevice();
    speakText("Elegir otra");
    setSelectedImage(null);
    setPredictionResult(null); // Limpia el resultado de la predicción anterior
    setObjectDescription("Descripción no disponible."); // Restablece la descripción del objeto
  };

  // Función para mostrar el modal con los detalles del objeto detectado
  const showObjectDetails = () => {
    vibrateDevice();
    setShowObjectInfo(true);
    // Si hay un resultado de predicción, busca la descripción en classLabels y la muestra
    if (predictionResult?.nombre) {
      let description = "Descripción no disponible.";
      for (const key in classLabels) {
        if (classLabels[key]?.nombre === predictionResult.nombre) {
          description = classLabels[key]?.descripcion || "Descripción no disponible.";
          break;
        }
      }
      speakText(`Información del objeto. ${predictionResult.nombre}. ${description}`);
      setObjectDescription(description);
    } else {
      speakText("No se detectó información del objeto.");
      setObjectDescription("No hay información disponible.");
    }
  };

  // Función para cerrar el modal de información del objeto
  const closeObjectInfo = () => {
    setShowObjectInfo(false);
    speakText("Información cerrada");
  };

  // Función para navegar de vuelta a la pantalla anterior
  const goBack = () => {
    vibrateDevice();
    speakText("Regresando al menú principal");
    setTimeout(() => {
      router.back();
    }, 500);
  };

  // Renderizado condicional: si se ha seleccionado una imagen y se ha obtenido un resultado de predicción
  if (selectedImage && predictionResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              vibrateDevice();
              speakText("Volver");
              goBack();
            }}
          >
            <Text style={styles.headerButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Objeto Detectado</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{predictionResult.nombre}</Text>
          {predictionResult?.confidence && (
            <Text style={styles.messageSubtext}>
              Confianza: {(predictionResult.confidence * 100).toFixed(2)}%
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              vibrateDevice();
              speakText("Elegir otra");
              selectAnotherImage();
            }}
          >
            <Text style={styles.actionButtonText}>Elegir otra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={showObjectDetails}
            disabled={!predictionResult}
          >
            <Text style={styles.actionButtonText}>Conocer más</Text>
          </TouchableOpacity>
        </View>

        {/* Modal con información del objeto */}
        <Modal visible={showObjectInfo} transparent={true} animationType="slide" onRequestClose={closeObjectInfo}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {predictionResult ? `🖼️ ${predictionResult.nombre}` : "Información"}
                </Text>
                <TouchableOpacity
                  onPress={closeObjectInfo}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.objectDescription}>
                  {objectDescription}
                </Text>
                {/* Puedes añadir más detalles aquí si lo deseas */}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeObjectInfo}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Renderizado inicial: pantalla para seleccionar una imagen de la galería
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            vibrateDevice();
            speakText("Volver");
            goBack();
          }}
        >
          <Text style={styles.headerButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cargar Foto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Selecciona una foto con el objeto para identificar</Text>
      </View>

      <View style={styles.galleryContainer}>
        <View style={styles.galleryPlaceholder}>
          <View style={styles.galleryIcon}>
            <Text style={styles.galleryEmoji}>🖼️</Text>
          </View>
          <Text style={styles.galleryTitle}>Galería de Fotos</Text>
          <Text style={styles.gallerySubtitle}>(Toca el botón para explorar tus fotos)</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={pickImage}
        >
          <View style={styles.selectButtonInner}>
            <Text style={styles.selectButtonText}>📱</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.selectHint}>Seleccionar Foto</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerButton: {
    fontSize: 18,
    color: "#1c1964",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1964",
  },
  headerSpacer: {
    width: 60,
  },
  instructionContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
  galleryContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    backgroundColor: "#9989c0",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryPlaceholder: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  galleryIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  galleryEmoji: {
    fontSize: 50,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  gallerySubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  controls: {
    paddingVertical: 30,
    alignItems: "center",
  },
  selectButton: {
    width: 100, // Aumentado de 80 a 100
    height: 100, // Aumentado de 80 a 100
    borderRadius: 50, // Ajustado para mantener la forma circular
    backgroundColor: "#5049e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#5049e5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  selectButtonInner: {
    width: 75, // Aumentado de 60 a 75
    height: 75, // Aumentado de 60 a 75
    borderRadius: 37.5, // Ajustado para mantener la forma circular
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 35, // Aumentado de 30 a 35
  },
  selectHint: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    fontWeight: "500",
  },
  imageContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  selectedImage: {
    flex: 1,
    width: "100%",
  },
  messageContainer: {
    backgroundColor: "#9989c0",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },
  messageText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  messageSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#453589",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center", // Agregado para centrar el texto
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 0,
    width: "100%",
    maxWidth: 400,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5049e5",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 20,
  },
  objectDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "justify",
  },
  objectFeatures: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1c1964",
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: "#5049e5",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", // Agregado para centrar el texto
  },
});