FROM gradle:8.5-jdk17-alpine as build
WORKDIR /workspace/app

COPY build.gradle settings.gradle ./
COPY gradle gradle
COPY gradlew ./

RUN chmod +x ./gradlew

# Download dependencies trước để tận dụng Docker cache
RUN ./gradlew dependencies --no-daemon || true

COPY src src

# Build application
RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp
ARG JAR_FILE=/workspace/app/build/libs/*.jar
COPY --from=build ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
