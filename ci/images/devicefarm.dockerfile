FROM python:3.7-buster

RUN apt-get update && apt-get install -y maven
ADD e2e-automation/appium-launcher/requirements.txt requirements.txt
RUN pip install -r requirements.txt