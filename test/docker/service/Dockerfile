# Use an official Node runtime as a parent image
FROM node:8.9.4

ARG options
ARG command_to_use
ENV options=$options
ENV command_to_use=$command_to_use

# Set the working directory
WORKDIR /service

# Copy the service contents into the container
ADD ./package.json ./package.json
ADD ./npm-shrinkwrap.json ./npm-shrinkwrap.json

RUN ["npm", "i"]

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start service
CMD ["sh", "-c", "${command_to_use} ${options}"]
