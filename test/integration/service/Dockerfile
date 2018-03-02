# Use an official Node runtime as a parent image
FROM node:8.9.4

ARG service_to_start
ARG options
ARG command_to_use

ENV options=$options
ENV command_to_use=$command_to_use

# Set the working directory
WORKDIR /service

# Copy the service contents into the container
# TODO, change the service to copy using ARGS
ADD ./${service_to_start} .

# Make port 3000 available to the world outside this container
EXPOSE 3000

RUN echo ${command_to_use}

# Start service
CMD ["sh", "-c", "${command_to_use} ${options}"]
