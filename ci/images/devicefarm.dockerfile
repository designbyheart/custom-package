FROM python:3.7-stretch

RUN apt-get update && apt-get install -y maven openjdk-8-jdk
ADD e2e-automation/appium-launcher/requirements.txt requirements.txt
RUN pip install -r requirements.txt