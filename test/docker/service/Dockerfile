# Use an official Node runtime as a parent image
FROM node:8.9.4

ARG options
ENV options=$options

# Set the working directory
WORKDIR /app

# Copy the service contents into the container
ADD ./install.sh .
ADD ./.install .

RUN ./install.sh

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start service
CMD ["sh", "-c", "cd ./test/services/service-to-run/lib && ./run.sh"]
