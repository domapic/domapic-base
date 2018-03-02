# Use an official Node runtime as a parent image
FROM node:8.9.4

ARG options=""
ENV options=$options

# Set the working directory
WORKDIR /service

# Copy the service contents into the container
# TODO, change the service to copy using ARGS
ADD ./start .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start service
CMD ["sh", "-c", "node server.js --name=foo-service ${options}"]
