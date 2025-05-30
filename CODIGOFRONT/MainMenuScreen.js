"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Speech from "expo-speech"
import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"

const { width, height } = Dimensions.get("window")

// Función para calcular tamaños responsivos
const getResponsiveSize = (baseSize) => {
  const scale = Math.min(width / 375, height / 667) // Base: iPhone 6/7/8
  return Math.max(baseSize * scale, baseSize * 0.8) // Mínimo 80% del tamaño base
}

const MainMenuScreen = ({ navigation }) => {
  // Estado para el modo accesibilidad
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  // Estado para el elemento enfocado actualmente (-1 significa ninguno)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  // Referencia para el tiempo del último toque (para detectar doble toque)
  const lastTapRef = useRef(0)
  // Referencia para el último botón tocado
  const lastTouchedButtonRef = useRef(-1)
  // Valor animado para el elemento enfocado
  const focusAnim = useRef(new Animated.Value(1)).current

  // Opciones del menú
  const menuOptions = [
    {
      title: "Tomemos una foto",
      subtitle: "Usa tu cámara para capturar momentos",
      icon: "camera",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo cámara")
        setTimeout(() => {
          router.push("/camera")
        }, 1000)
      },
      color: "#5049e5",
      shadowColor: "#5049e5",
    },
    {
      title: "Carguemos una foto",
      subtitle: "Selecciona desde tu galería",
      icon: "images",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo galería")
        setTimeout(() => {
          router.push("/gallery")
        }, 1000)
      },
      color: "#9989c0",
      shadowColor: "#9989c0",
    },
    {
      title: "Cómo usar la app",
      subtitle: "Guía paso a paso para usar todas las funciones",
      icon: "book",
      onPress: () => {
        vibrateDevice()
        speakText("Abriendo información")
        setTimeout(() => {
          router.push("/about")
        }, 1000)
      },
      color: "#453589",
      shadowColor: "#453589",
    },
  ]

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

  // Función para activar/desactivar el modo accesibilidad
  const toggleAccessibilityMode = () => {
    const newMode = !accessibilityMode
    setAccessibilityMode(newMode)

    if (newMode) {
      speakText("Modo accesibilidad activado. Toque una vez para escuchar, doble toque para seleccionar.")
      setFocusedIndex(0) // Enfocar el primer elemento
    } else {
      speakText("Modo accesibilidad desactivado")
      setFocusedIndex(-1)
    }
  }

  // Función para manejar el enfoque de un elemento
  const focusItem = (index) => {
    if (index >= 0 && index < menuOptions.length) {
      setFocusedIndex(index)

      // Animar el elemento enfocado
      Animated.sequence([
        Animated.timing(focusAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      // Vibrar suavemente
      Vibration.vibrate(50)
    }
  }

  // Función para manejar el toque en un botón específico
  const handleButtonTouch = (index) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 400

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY && lastTouchedButtonRef.current === index) {
      // Doble toque en el mismo botón - ejecutar acción
      Speech.stop()
      menuOptions[index].onPress()
    } else {
      // Toque simple - enfocar y leer
      focusItem(index)
      lastTouchedButtonRef.current = index
      Speech.stop()
      setTimeout(() => {
        speakText(menuOptions[index].title)
      }, 100)
    }

    lastTapRef.current = now
  }

  // Reproducir mensaje de bienvenida al cargar la pantalla
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(
        "Menú principal. ¿Cómo quieres subir la foto? Mantén presionado el botón de accesibilidad para activar el modo especial.",
      )
    }, 500)

    return () => {
      clearTimeout(timer)
      Speech.stop()
    }
  }, [])

  // Efecto para enfocar el primer elemento cuando se activa el modo accesibilidad
  useEffect(() => {
    if (accessibilityMode && focusedIndex === 0) {
      // Pequeño retraso para que termine de hablar el mensaje de activación
      setTimeout(() => {
        focusItem(0)
        // Leer el primer elemento automáticamente
        setTimeout(() => {
          speakText(menuOptions[0].title)
        }, 500)
      }, 2000)
    }
  }, [accessibilityMode])

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con el color azul oscuro */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}> </Text>
        <Text style={styles.headerTitle}>¡Estamos aquí para ayudarte!</Text>
        <Text style={styles.headerSubtitle}>Selecciona como subirás tu foto</Text>

        {/* Botón de accesibilidad */}
        <TouchableOpacity
          style={styles.accessibilityButton}
          onLongPress={toggleAccessibilityMode}
          delayLongPress={3000}
        >
          <Ionicons name={accessibilityMode ? "eye" : "eye-outline"} size={getResponsiveSize(24)} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              focusedIndex === index && accessibilityMode
                ? {
                    transform: [{ scale: focusAnim }],
                    borderWidth: 3,
                    borderColor: "#fff",
                    borderRadius: getResponsiveSize(28),
                  }
                : {},
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuButton,
                {
                  backgroundColor: option.color,
                  shadowColor: option.shadowColor,
                },
              ]}
              onPress={() => {
                if (accessibilityMode) {
                  // En modo accesibilidad, manejar toque simple/doble
                  handleButtonTouch(index)
                } else {
                  // Modo normal, ejecutar directamente
                  option.onPress()
                }
              }}
              activeOpacity={0.7}
              accessibilityLabel={option.title}
              accessibilityHint={option.subtitle}
              accessibilityRole="button"
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={option.icon} size={getResponsiveSize(45)} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonTitle}>{option.title}</Text>
                  <Text style={styles.buttonSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {accessibilityMode && (
        <View style={styles.accessibilityInstructions}>
          <Text style={styles.accessibilityText}>Modo accesibilidad activado</Text>
          <Text style={styles.accessibilitySubtext}>• Toque simple: Escuchar nombre del botón</Text>
          <Text style={styles.accessibilitySubtext}>• Doble toque: Abrir la opción seleccionada</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    paddingTop: Math.max(height * 0.06, 30), // Responsivo basado en altura
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
    paddingBottom: Math.max(height * 0.05, 25), // Responsivo basado en altura
    backgroundColor: "#1c1964",
    borderBottomLeftRadius: getResponsiveSize(35),
    borderBottomRightRadius: getResponsiveSize(35),
    marginBottom: Math.max(height * 0.035, 20), // Responsivo basado en altura
    elevation: 8,
    shadowColor: "#1c1964",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: "relative",
  },
  headerTitle: {
    fontSize: getResponsiveSize(26), // Reducido de 28
    fontWeight: "bold",
    color: "white",
    marginBottom: getResponsiveSize(12),
    textAlign: "center",
    lineHeight: getResponsiveSize(32), // Reducido de 34
  },
  headerSubtitle: {
    fontSize: getResponsiveSize(16), // Reducido de 18
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: getResponsiveSize(22), // Reducido de 24
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
    justifyContent: "center",
    paddingVertical: height * 0.02, // Padding vertical responsivo
  },
  menuButton: {
    marginVertical: Math.max(height * 0.012, 8), // Reducido de 12
    borderRadius: getResponsiveSize(25),
    elevation: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    minHeight: Math.max(height * 0.12, 85), // Reducido de 110, mínimo 85
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Math.max(height * 0.025, 18), // Reducido de 25
    paddingHorizontal: width * 0.067, // ~25px en pantalla de 375px
  },
  iconContainer: {
    marginRight: getResponsiveSize(18), // Reducido de 20
    alignItems: "center",
    justifyContent: "center",
    width: getResponsiveSize(60), // Reducido de 70
    height: getResponsiveSize(60), // Reducido de 70
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getResponsiveSize(18), // Reducido de 20
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonTitle: {
    fontSize: getResponsiveSize(22), // Reducido de 24
    fontWeight: "bold",
    color: "white",
    marginBottom: getResponsiveSize(5), // Reducido de 6
    lineHeight: getResponsiveSize(28), // Reducido de 30
  },
  buttonSubtitle: {
    fontSize: getResponsiveSize(14), // Reducido de 16
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    lineHeight: getResponsiveSize(20), // Reducido de 22
  },
  footer: {
    paddingVertical: getResponsiveSize(25),
    paddingHorizontal: getResponsiveSize(30),
    alignItems: "center",
  },
  accessibilityButton: {
    position: "absolute",
    top: Math.max(height * 0.06, 30), // Responsivo basado en altura
    right: width * 0.053, // ~20px en pantalla de 375px
    width: getResponsiveSize(44),
    height: getResponsiveSize(44),
    borderRadius: getResponsiveSize(22),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  accessibilityInstructions: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: getResponsiveSize(20),
    borderRadius: getResponsiveSize(15),
    margin: getResponsiveSize(20),
  },
  accessibilityText: {
    color: "white",
    fontSize: getResponsiveSize(16), // Reducido de 18
    fontWeight: "bold",
    marginBottom: getResponsiveSize(10),
    textAlign: "center",
  },
  accessibilitySubtext: {
    color: "white",
    fontSize: getResponsiveSize(13), // Reducido de 14
    marginBottom: getResponsiveSize(5),
  },
})

export default MainMenuScreen
