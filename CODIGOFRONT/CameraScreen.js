"use client"

import axios from 'axios'; // Importa axios para las peticiones HTTP
import { CameraView, useCameraPermissions } from "expo-camera"; // Importa componentes y hooks de la cámara de Expo
import { router } from "expo-router"; // Importa el router de Expo para la navegación entre pantallas
import * as Speech from "expo-speech"; // Importa la librería de Expo para la síntesis de voz (text-to-speech)
import { useEffect, useRef, useState } from "react"; // Importa hooks de React para la gestión del estado y efectos secundarios, y useRef para referenciar componentes
import { Alert, Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"; // Importa componentes y módulos de React Native para la interfaz de usuario

export default function CameraScreen() {
  // Estados para la gestión de la interfaz de usuario y los datos
  const [photo, setPhoto] = useState(null); // Estado para almacenar los datos de la foto tomada (URI, base64, etc.)
  const [predictionResult, setPredictionResult] = useState(null); // Estado para almacenar el resultado de la predicción del backend
  const [permission, requestPermission] = useCameraPermissions(); // Hook para gestionar los permisos de la cámara
  const [accessibilityMode, setAccessibilityMode] = useState(false); // Estado para controlar el modo de accesibilidad (actualmente no implementado completamente)
  const [showObjectInfo, setShowObjectInfo] = useState(false); // Estado para controlar la visibilidad del modal de información del objeto
  const cameraRef = useRef(null); // Referencia al componente CameraView para interactuar con la cámara
  const [objectDescription, setObjectDescription] = useState("Descripción no disponible."); // Estado para almacenar la descripción del objeto detectado

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

  // Efecto para obtener el estado del modo accesibilidad al montar el componente
  useEffect(() => {
    setAccessibilityMode(false); // Simulación: aquí iría la lógica para cargar el estado de accesibilidad persistido
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute una vez

  // Efecto para el mensaje de bienvenida al cargar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText("Posiciona el objeto en el cuadrado y toca el botón para capturar");
    }, 500);

    // Función de limpieza del efecto: cancela el timeout y detiene la síntesis de voz si el componente se desmonta
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []); // El array de dependencias vacío asegura que esto solo se ejecute una vez

  // Función asíncrona para tomar una foto
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        vibrateDevice();
        // Toma una foto con la cámara y obtiene sus datos
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true, // Se incluye base64 aunque no se use directamente en la función sendToBackend actual
        });
        setPhoto(photoData); // Actualiza el estado con los datos de la foto
        await sendToBackend(photoData.base64, photoData.uri); // Llama a la función para enviar la foto al backend, pasando el URI
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto. Inténtalo de nuevo.");
      }
    }
  };

  // Función asíncrona para enviar la imagen al backend para la predicción
  const sendToBackend = async (base64Image, imageUri) => { // Recibe la imagen en base64 (no se usa directamente ahora) y su URI
    if (!imageUri) {
      Alert.alert("Error", "URI de la imagen no disponible.");
      return;
    }

    const apiUrl = 'http://172.200.240.238:8080/predict/'; // URL del endpoint de predicción del backend
    const formData = new FormData(); // Crea un objeto FormData para enviar archivos

    // Añade la imagen al FormData utilizando su URI
    formData.append('file', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      // Realiza una petición POST al backend con la imagen
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Respuesta del backend:", response.data);
      // Si la respuesta contiene detecciones, actualiza el estado con el primer resultado y habla el nombre del objeto
      if (response.data && response.data.detections && response.data.detections.length > 0) {
        setPredictionResult(response.data.detections[0]);
        speakText(`Se detectó ${response.data.detections[0]?.nombre} con una confianza de ${(response.data.detections[0]?.confidence * 100).toFixed(2)} por ciento.`);
      } else {
        speakText("No se detectó ningún objeto.");
        setPredictionResult(null);
      }
    } catch (error) {
      console.error("Error al enviar la imagen al backend:", error);
      Alert.alert("Error", "No se pudo contactar al servidor. Asegúrate de que la IP y el puerto sean correctos y el servidor esté funcionando.");
      speakText("Error al contactar al servidor.");
      setPredictionResult(null);
    }
  };

  // Función para volver a tomar la foto, reseteando el estado de la foto y la predicción
  const retakePicture = () => {
    setPhoto(null);
    setPredictionResult(null); // Limpia el resultado de la predicción anterior
    speakText("Toma otra foto");
  };

  // Función para mostrar el modal con los detalles del objeto detectado
  const showObjectDetails = () => {
    vibrateDevice();
    setShowObjectInfo(true);
    // Si hay un resultado de predicción con un nombre, busca su descripción en classLabels
    if (predictionResult?.nombre) {
      let description = "Descripción no disponible.";
      for (const key in classLabels) {
        if (classLabels[key]?.nombre === predictionResult.nombre) {
          description = classLabels[key]?.descripcion || "Descripción no disponible.";
          break;
        }
      }
      speakText(`Información del objeto. ${predictionResult.nombre}. ${description}`);
      setObjectDescription(description); // Actualiza el estado de la descripción para mostrarla en el modal
    } else {
      speakText("No hay información del objeto detectado.");
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

  // Diccionario de clases que mapea los IDs de predicción a nombres y descripciones de objetos (copiado de la API)
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

  // Renderizado condicional: si no se tienen los permisos de la cámara
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado condicional: si los permisos de la cámara no están concedidos
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Necesitamos acceso a tu cámara para tomar fotos</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              vibrateDevice();
              speakText("Permitir Cámara");
              requestPermission(); // Solicita los permisos de la cámara
            }}
          >
            <Text style={styles.buttonText}>Permitir Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              vibrateDevice();
              speakText("Volver al Menú");
              goBack(); // Navega de vuelta a la pantalla anterior
            }}
          >
            <Text style={styles.buttonText}>Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado condicional: si ya se tomó la foto
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              vibrateDevice();
              speakText("Volver a tomar foto");
              retakePicture(); // Permite al usuario tomar otra foto
            }}
          >
            <Text style={styles.headerButton}>← Otra foto</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Objeto Detectado</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.photoContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            {predictionResult ? `Objeto: ${predictionResult.nombre}` : "Analizando..."}
          </Text>
          {predictionResult?.confidence && (
            <Text style={styles.messageSubtext}>
              Confianza: {(predictionResult.confidence * 100).toFixed(2)}%
            </Text>
          )}
          {!predictionResult && <Text style={styles.messageSubtext}>Por favor espera...</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={retakePicture}
          >
            <Text style={styles.actionButtonText}>Tomar otra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={showObjectDetails}
            disabled={!predictionResult} // Deshabilita el botón si aún no hay resultado de predicción
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
                  {predictionResult ? `💻 ${predictionResult.nombre}` : "Información"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    vibrateDevice();
                    speakText("Cerrar información");
                    closeObjectInfo(); // Cierra el modal de información
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {predictionResult?.nombre ? (
                  <Text style={styles.objectDescription}>
                    {objectDescription}
                  </Text>
                ) : (
                  <Text style={styles.objectDescription}>No hay información disponible del objeto.</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  vibrateDevice();
                  speakText("Cerrar");
                  closeObjectInfo(); // Cierra el modal
                }}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Renderizado de la pantalla de la cámara
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            vibrateDevice();
            speakText("Volver al menú");
            goBack(); // Navega de vuelta al menú principal
          }}
        >
          <Text style={styles.headerButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tomar Foto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Posiciona el objeto en el cuadrado y toca el botón para capturar</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={styles.cameraFrame} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => {
            speakText("Capturando foto");
            takePicture(); // Llama a la función para tomar la foto
          }}
        >
          <View style={styles.captureButtonInner}>
            <Text style={styles.captureButtonText}>📸</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.captureHint}>Toca para capturar</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
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
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraFrame: {
    position: "absolute",
    top: "20%",
    left: "15%",
    right: "15%",
    bottom: "20%",
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 15,
    backgroundColor: "transparent",
  },
  controls: {
    paddingVertical: 30,
    alignItems: "center",
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  captureButtonInner: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonText: {
    fontSize: 35,
  },
  captureHint: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    fontWeight: "500",
  },
  photoContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  photo: {
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
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#5049e5",
    fontWeight: "600",
  },
  permissionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: 200,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#9989c0",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
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
    textAlign: "center",
  },
});
