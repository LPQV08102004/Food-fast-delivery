# Stage 1: Build javapayment
FROM maven:3.9-eclipse-temurin-17-alpine AS javapayment-build
WORKDIR /javapayment
COPY javapayment/pom.xml .
COPY javapayment/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build payment-service
FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /workspace/app

# Create directory and copy javapayment jar
RUN mkdir -p ../javapayment/target
COPY --from=javapayment-build /javapayment/target/momopayment-1.0.jar ../javapayment/target/momopayment-1.0.jar

# Copy payment-service files (context is root, so no payment-service/ prefix)
COPY payment-service/build.gradle payment-service/settings.gradle payment-service/gradlew ./
COPY payment-service/gradle gradle
COPY payment-service/src src

RUN chmod +x ./gradlew
# Use --refresh-dependencies to force re-download if needed
RUN ./gradlew build -x test --no-daemon --refresh-dependencies || \
    ./gradlew build -x test --no-daemon --stacktrace

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/app/build/libs/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","app.jar"]
