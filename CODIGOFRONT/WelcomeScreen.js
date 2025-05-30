import { router } from 'expo-router';
import * as Speech from 'expo-speech'; // ← NUEVO: Importar Speech
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  const slides = [
    {
      image: require('../assets/images/delizar1.png'),
      speech: 'Bienvenido a Natelly, tu app de ayuda visual. Desliza para continuar.' // ← NUEVO
    },
    {
      image: require('../assets/images/deslizar2.png'),
      speech: 'Identifica objetos fácilmente con un solo clic.' // ← NUEVO
    },
  ];

  // ← NUEVO: Función para hablar
  const speak = (text) => {
    Speech.speak(text, {
      language: 'es',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  // ← NUEVO: Hablar cuando cambia de slide
  useEffect(() => {
    if (slides[currentSlide]) {
      speak(slides[currentSlide].speech);
    }
  }, [currentSlide]);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToMainMenu = () => {
    speak('Empezar'); // ← NUEVO: Hablar antes de navegar
    
    // ← NUEVO: Pequeña pausa para que termine de hablar
    setTimeout(() => {
      router.push('/main-menu');
    }, 800);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Image 
              source={slide.image} 
              style={styles.slideImage}
            />
          </View>
        ))}
      </ScrollView>

      {/* Botón ENCIMA de los puntos */}
      {currentSlide === slides.length - 1 && (
        <TouchableOpacity style={styles.startButton} onPress={goToMainMenu}>
          <Text style={styles.startButtonText}>Empezar</Text>
        </TouchableOpacity>
      )}

      {/* Puntos DEBAJO del botón */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentSlide === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  startButton: {
    backgroundColor: '#4f49e8',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 25,
    marginHorizontal: 40,
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    zIndex: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    zIndex: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default WelcomeScreen;