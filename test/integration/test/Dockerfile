# Use an official Nodejs runtime as a parent image
FROM node:8.9.4

# Set the working directory
WORKDIR /test

# Copy the test contents into the container
# TODO, change the service to copy using ARGS
ADD ./start .
RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["./wait-for-it.sh", "service:3000", "--", "npm", "run", "test"]
