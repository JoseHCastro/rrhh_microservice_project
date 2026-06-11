#!/bin/bash
echo "Iniciando proceso de construcción del APK..."
cd /home/debian/Documents/Software_II/2026/parcial2/rrhh_microservice_project/rrhh_front_react_native
# Instalar dependencias si faltan
npm install
# Ejecutar contenedor de Android para construir el APK
docker run --rm -v $(pwd):/app -w /app reactnativecommunity/react-native-android bash -c "cd android && chmod +x gradlew && ./gradlew assembleRelease"
echo "Construcción finalizada. El APK debería estar en rrhh_front_react_native/android/app/build/outputs/apk/release/app-release.apk"
