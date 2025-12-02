export const templates = {
  go: {
    generateFiles: (config) => [
      {
        path: 'go.mod',
        content: `module ${config.projectName}

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/prometheus/client_golang v1.17.0
    github.com/sirupsen/logrus v1.9.3
)
`
      },
      {
        path: 'cmd/server/main.go',
        content: `package main

import (
    "context"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "github.com/sirupsen/logrus"
)

func main() {
    // Setup logging
    logrus.SetFormatter(&logrus.JSONFormatter{})
    logrus.SetLevel(logrus.InfoLevel)

    // Setup router
    r := gin.New()
    r.Use(gin.Logger())
    r.Use(gin.Recovery())

    // Health endpoints
    r.GET("/health", healthHandler)
    r.GET("/ready", readyHandler)
    
    // Metrics endpoint
    r.GET("/metrics", gin.WrapH(promhttp.Handler()))

    // API routes
    v1 := r.Group("/api/v1")
    {
        v1.GET("/status", statusHandler)
    }

    // Start server
    srv := &http.Server{
        Addr:    ":8080",
        Handler: r,
    }

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logrus.Fatalf("listen: %s\\n", err)
        }
    }()

    // Wait for interrupt signal to gracefully shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    logrus.Println("Shutdown Server ...")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        logrus.Fatal("Server Shutdown:", err)
    }
    logrus.Println("Server exiting")
}

func healthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

func readyHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ready"})
}

func statusHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "service": "${config.projectName}",
        "version": "1.0.0",
        "timestamp": time.Now().UTC(),
    })
}
`
      },
      {
        path: 'Dockerfile',
        content: `# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Create non-root user
RUN addgroup -g 1000 appgroup && \\
    adduser -D -s /bin/sh -u 1000 -G appgroup appuser

COPY --from=builder /app/main .
RUN chown appuser:appgroup main

USER appuser

EXPOSE 8080

CMD ["./main"]
`
      },
      {
        path: 'README.md',
        content: `# ${config.projectName}

${config.description || 'A scalable Go service'}

## Features

- RESTful API with Gin framework
- Health check endpoints
- Prometheus metrics
- Structured logging
- Docker containerization
- Kubernetes deployment ready
- Security scanning integrated

## Getting Started

### Prerequisites

- Go 1.21+
- Docker
- Kubernetes (optional)

### Running Locally

\`\`\`bash
go mod download
go run cmd/server/main.go
\`\`\`

### Running with Docker

\`\`\`bash
docker build -t ${config.projectName} .
docker run -p 8080:8080 ${config.projectName}
\`\`\`

### API Endpoints

- \`GET /health\` - Health check
- \`GET /ready\` - Readiness check
- \`GET /metrics\` - Prometheus metrics
- \`GET /api/v1/status\` - Service status

## Security

This project includes:
- Container security scanning with Trivy
- Static analysis with gosec
- Dependency vulnerability scanning
- Non-root container execution
- Read-only root filesystem

## Monitoring

- Prometheus metrics exposed on \`/metrics\`
- Grafana dashboards included
- Health check endpoints for Kubernetes probes

## Deployment

See \`deployments/k8s/\` for Kubernetes manifests.
`
      }
    ]
  },

  nodejs: {
    generateFiles: (config) => [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: config.projectName,
          version: '1.0.0',
          description: config.description || 'A scalable Node.js service',
          main: 'src/index.js',
          scripts: {
            start: 'node src/index.js',
            dev: 'nodemon src/index.js',
            test: 'jest',
            'test:coverage': 'jest --coverage',
            lint: 'eslint src/',
            'lint:fix': 'eslint src/ --fix',
            'security:audit': 'npm audit',
            'security:check': 'npm audit --audit-level moderate'
          },
          dependencies: {
            express: '^4.18.2',
            helmet: '^7.0.0',
            cors: '^2.8.5',
            'express-rate-limit': '^6.8.1',
            'prom-client': '^14.2.0',
            winston: '^3.10.0',
            dotenv: '^16.3.1'
          },
          devDependencies: {
            nodemon: '^3.0.1',
            jest: '^29.6.2',
            supertest: '^6.3.3',
            eslint: '^8.45.0',
            '@eslint/js': '^8.45.0'
          },
          engines: {
            node: '>=18.0.0'
          }
        }, null, 2)
      },
      {
        path: 'src/index.js',
        content: `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const promClient = require('prom-client');
const winston = require('winston');
require('dotenv').config();

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Setup metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDuration);

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: '${config.projectName}',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});

module.exports = app;
`
      },
      {
        path: 'Dockerfile',
        content: `FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1000 appgroup && \\
    adduser -D -s /bin/sh -u 1000 -G appgroup appuser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy app source
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

CMD [ "node", "src/index.js" ]
`
      },
      {
        path: 'healthcheck.js',
        content: `const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
`
      }
    ]
  },

  python: {
    generateFiles: (config) => [
      {
        path: 'requirements.txt',
        content: `fastapi==0.103.0
uvicorn[standard]==0.23.2
prometheus-client==0.17.1
structlog==23.1.0
python-multipart==0.0.6
pydantic==2.1.1
httpx==0.24.1
`
      },
      {
        path: 'src/main.py',
        content: `import asyncio
import signal
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Setup structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = asyncio.get_event_loop().time()
        
        response = await call_next(request)
        
        duration = asyncio.get_event_loop().time() - start_time
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ${config.projectName}")
    yield
    logger.info("Shutting down ${config.projectName}")

app = FastAPI(
    title="${config.projectName}",
    description="${config.description || 'A scalable Python service'}",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MetricsMiddleware)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
async def readiness_check():
    return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}

@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    return generate_latest()

@app.get("/api/v1/status")
async def get_status():
    return {
        "service": "${config.projectName}",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}, shutting down gracefully")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        log_config=None,  # Use structlog instead
        access_log=False
    )
`
      },
      {
        path: 'Dockerfile',
        content: `FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD python -c "import requests; requests.get('http://localhost:8080/health', timeout=2)"

CMD ["python", "src/main.py"]
`
      }
    ]
  },

  java: {
    generateFiles: (config) => [
      {
        path: 'pom.xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${config.projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>${config.projectName}</name>
    <description>${config.description || 'A scalable Java service'}</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.2</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            
            <plugin>
                <groupId>org.owasp</groupId>
                <artifactId>dependency-check-maven</artifactId>
                <version>8.3.1</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>check</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
`
      },
      {
        path: 'src/main/java/com/example/Application.java',
        content: `package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`
      },
      {
        path: 'src/main/java/com/example/controller/StatusController.java',
        content: `package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class StatusController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
            "service", "${config.projectName}",
            "version", "1.0.0",
            "timestamp", Instant.now().toString()
        );
    }
}
`
      },
      {
        path: 'src/main/resources/application.yml',
        content: `server:
  port: 8080
  shutdown: graceful

spring:
  application:
    name: ${config.projectName}
  security:
    user:
      name: admin
      password: \${ADMIN_PASSWORD:changeme}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true

logging:
  level:
    com.example: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
`
      },
      {
        path: 'Dockerfile',
        content: `FROM openjdk:17-jdk-slim as builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN ./mvnw clean package -DskipTests

FROM openjdk:17-jre-slim

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
`
      }
    ]
  },

  dotnet: {
    generateFiles: (config) => [
      {
        path: `${config.projectName}.csproj`,
        content: `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="7.0.9" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="7.0.0" />
    <PackageReference Include="Serilog.Sinks.Console" Version="4.1.0" />
    <PackageReference Include="prometheus-net.AspNetCore" Version="8.0.1" />
  </ItemGroup>

</Project>
`
      },
      {
        path: 'Program.cs',
        content: `using Prometheus;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseRouting();

// Add Prometheus metrics
app.UseHttpMetrics();
app.MapMetrics();

// Add health checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/ready");

app.MapControllers();

// Status endpoint
app.MapGet("/api/v1/status", () => new
{
    Service = "${config.projectName}",
    Version = "1.0.0",
    Timestamp = DateTime.UtcNow
});

app.Run();
`
      },
      {
        path: 'Controllers/StatusController.cs',
        content: `using Microsoft.AspNetCore.Mvc;

namespace ${config.projectName}.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Service = "${config.projectName}",
            Version = "1.0.0",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
        });
    }
}
`
      },
      {
        path: 'appsettings.json',
        content: JSON.stringify({
          Logging: {
            LogLevel: {
              Default: "Information",
              "Microsoft.AspNetCore": "Warning"
            }
          },
          AllowedHosts: "*",
          Serilog: {
            Using: ["Serilog.Sinks.Console"],
            MinimumLevel: "Information",
            WriteTo: [
              {
                Name: "Console",
                Args: {
                  outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
                }
              }
            ]
          }
        }, null, 2)
      },
      {
        path: 'Dockerfile',
        content: `FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["${config.projectName}.csproj", "."]
RUN dotnet restore "${config.projectName}.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "${config.projectName}.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "${config.projectName}.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app
COPY --from=publish /app/publish .

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:80/health || exit 1

ENTRYPOINT ["dotnet", "${config.projectName}.dll"]
`
      }
    ]
  }
}
