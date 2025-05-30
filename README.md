# Asistente de Limitantes Visuales para Reconocimiento de Objetos del Laboratorio Smart Center de la Unab
Nathalia Quintero - Angelly Cristancho

------------------------------------------------
Objetivo: Desarrollar una aplicación móvil para Android que capture una foto, la envíe a un servidor backend desplegado en Azure mediante una API REST, procese la imagen usando el modelo preentrenado YOLOv8, y muestre la predicción en la aplicación móvil.

-------------------------------------------------
1. Backend – FastAPI en Azure (Ubuntu Server 24.04 LTS)
  
1.1 Crear y configurar la máquina virtual en Azure.
   
   Accedemos al portal: https://portal.azure.com
   Creamos una nueva máquina virtual con:
   Grupo de recursos: personalizado.
   Nombre de la VM: libre. Región: East US (predeterminada).
   Zona: 1. Imagen: Ubuntu Server 24.04 LTS.
   Tipo de autenticación: Clave pública SSH.
   Puertos abiertos: SSH (22) y más adelante el puerto de la API (8720).
   
1.2 Configuración del Bitvise
![image](https://github.com/user-attachments/assets/fdd30aa4-d040-42eb-ba77-f3c18517baa1)

