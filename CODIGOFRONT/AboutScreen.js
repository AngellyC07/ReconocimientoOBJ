"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import * as Speech from "expo-speech"
import { useEffect } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"

const AboutScreen = () => {
  // Función para reproducir texto por voz
  const speakText = (text) => {
    Speech.speak(text, {
      language: "es",
      pitch: 1.0,
      rate: 0.9,
    })
  }

  // Función para vibrar el dispositivo
  const vibrateDevice = () => {
    Vibration.vibrate(100)
  }

  // Mensaje de bienvenida al cargar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText("Instrucciones de uso")
    }, 500)

    return () => {
      clearTimeout(timer)
      Speech.stop()
    }
  }, [])

  const tutorialSteps = [
    {
      icon: "home-outline",
      title: "Pantalla Principal",
      description:
        "Navega entre las opciones para identificar objetos: tomar foto, cargar desde galería o ver estas instrucciones",
      color: "#5049e5",
      tips: [
        "Toca 'Tomemos una foto' para usar la cámara",
        "Toca 'Carguemos una foto' para seleccionar de galería",
        "Regresa al menú principal con el botón 'Volver'",
      ],
      fullText:
        "Pantalla Principal. Navega entre las opciones para identificar objetos: tomar foto, cargar desde galería o ver estas instrucciones. Consejos útiles: Toca 'Tomemos una foto' para usar la cámara, Toca 'Carguemos una foto' para seleccionar de galería, Regresa al menú principal con el botón 'Volver'",
    },
    {
      icon: "camera-outline",
      title: "Tomar Fotos de Objetos",
      description: "Captura objetos con la cámara para que el modelo de inteligencia artificial los identifique",
      color: "#ff6b6b",
      tips: [
        "Posiciona el objeto dentro del marco blanco",
        "Toca el botón circular grande para capturar",
        "El modelo identificará automáticamente el objeto",
        "Presiona 'Conocer más' para ver información detallada",
      ],
      fullText:
        "Tomar Fotos de Objetos. Captura objetos con la cámara para que el modelo de inteligencia artificial los identifique. Consejos útiles: Posiciona el objeto dentro del marco blanco, Toca el botón circular grande para capturar, El modelo identificará automáticamente el objeto, Presiona 'Conocer más' para ver información detallada",
    },
    {
      icon: "images-outline",
      title: "Cargar Fotos de Objetos",
      description: "Selecciona imágenes de objetos desde tu galería para que sean analizadas por el modelo",
      color: "#4ecdc4",
      tips: [
        "Toca el botón para abrir tu galería",
        "Selecciona una imagen que contenga un objeto claro",
        "El modelo procesará la imagen automáticamente",
        "Recibe la identificación del objeto detectado",
      ],
      fullText:
        "Cargar Fotos de Objetos. Selecciona imágenes de objetos desde tu galería para que sean analizadas por el modelo. Consejos útiles: Toca el botón para abrir tu galería, Selecciona una imagen que contenga un objeto claro, El modelo procesará la imagen automáticamente, Recibe la identificación del objeto detectado",
    },
    {
      icon: "brain-outline",
      title: "Modelo de Inteligencia Artificial",
      description: "Utiliza un modelo entrenado con Keras para identificar y clasificar objetos en las imágenes",
      color: "#e91e63",
      tips: [
        "El modelo fue entrenado con miles de imágenes",
        "Puede identificar múltiples tipos de objetos",
        "Proporciona información detallada sobre cada objeto",
        "La precisión mejora con imágenes claras y bien iluminadas",
      ],
      fullText:
        "Modelo de Inteligencia Artificial. Utiliza un modelo entrenado con Keras para identificar y clasificar objetos en las imágenes. Consejos útiles: El modelo fue entrenado con miles de imágenes, Puede identificar múltiples tipos de objetos, Proporciona información detallada sobre cada objeto, La precisión mejora con imágenes claras y bien iluminadas",
    },
  ]

  const handleStepPress = (step) => {
    vibrateDevice()
    speakText(step.fullText)
  }

  const goBack = () => {
    vibrateDevice()
    speakText("Regresando al menú principal")
    setTimeout(() => {
      router.back()
    }, 500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cómo Usar la App</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconContainer}>
              <Ionicons name="eye" size={60} color="#667eea" />
            </View>
            <Text style={styles.welcomeTitle}>¡Identificador de Objetos IA!</Text>
            <Text style={styles.welcomeText}>
              Esta app utiliza inteligencia artificial para identificar objetos en tus fotos. Toma una foto o selecciona
              una imagen y descubre qué objeto detecta nuestro modelo entrenado con Keras.
            </Text>
          </View>

          {tutorialSteps.map((step, index) => (
            <TouchableOpacity key={index} style={styles.stepCard} onPress={() => handleStepPress(step)}>
              <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: step.color }]}>
                  <Ionicons name={step.icon} size={30} color="white" />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>

              <Text style={styles.stepDescription}>{step.description}</Text>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Consejos útiles:</Text>
                {step.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipRow}>
                    <Ionicons name="checkmark-circle" size={20} color={step.color} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tapHint}>
                <Ionicons name="volume-high" size={16} color="#666" />
                <Text style={styles.tapHintText}>Toca para escuchar</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.funFactsCard}>
            <Ionicons name="sparkles" size={40} color="#ffd700" />
            <Text style={styles.funFactsTitle}>¿Sabías que...?</Text>
            <Text style={styles.funFactsText}>
              Los modelos de inteligencia artificial como el que usa esta app pueden reconocer miles de objetos
              diferentes. Cada vez que usas la app, estás experimentando con tecnología de vanguardia que aprende de
              millones de imágenes.
            </Text>
          </View>

          <View style={styles.finalCard}>
            <Ionicons name="rocket" size={40} color="#ff6b6b" />
            <Text style={styles.finalTitle}>¡Ahora estás listo!</Text>
            <Text style={styles.finalText}>
              Ya conoces cómo funciona el identificador de objetos con IA. ¡Es momento de probar el modelo y descubrir
              qué objetos puede reconocer!
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                vibrateDevice()
                speakText("Comenzar a identificar objetos")
                setTimeout(() => {
                  router.back()
                }, 1000)
              }}
            >
              <Text style={styles.startButtonText}>¡Comenzar a identificar objetos!</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hecho con ❤️ y tecnología de IA</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginVertical: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  stepCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: "relative",
  },
  stepNumber: {
    position: "absolute",
    top: -15,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  stepNumberText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  stepDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 20,
  },
  tipsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  tapHintText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    fontStyle: "italic",
  },
  funFactsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginVertical: 20,
  },
  funFactsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
    textAlign: "center",
  },
  funFactsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  finalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginVertical: 20,
  },
  finalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
    textAlign: "center",
  },
  finalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },
  startButton: {
    backgroundColor: "#5049e5",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#5049e5",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
})

export default AboutScreen
