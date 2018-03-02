# Use an official Nodejs runtime as a parent image
FROM node:8.9.4

ARG test_to_run

# Set the working directory
WORKDIR /test

# Copy the test contents into the container
ADD ./basics .
ADD ./${test_to_run} .
RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["./wait-for-it.sh", "service:3000", "--", "npm", "run", "test"]
