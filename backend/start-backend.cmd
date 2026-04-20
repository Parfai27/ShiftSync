@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-21"
set "MAVEN_HOME=C:\Users\HP\tools\apache-maven-3.9.9"
set "SHIFT_SYNC_DB_URL=jdbc:postgresql://localhost:5432/shiftsync"
set "SHIFT_SYNC_DB_USERNAME=postgres"
set "SHIFT_SYNC_DB_PASSWORD=12345"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"
cd /d "C:\Users\HP\OneDrive\Documents\Thesis\ShiftSync\backend"
call "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run > "C:\Users\HP\OneDrive\Documents\Thesis\ShiftSync\backend\backend-run.log" 2>&1
