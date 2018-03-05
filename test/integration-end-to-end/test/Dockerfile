# Use an official Nodejs runtime as a parent image
FROM node:8.9.4

ARG test_type
ARG test_to_run

# Set the working directory
WORKDIR /test

# Copy the test contents into the container
ADD ./common .
ADD ./${test_type}/${test_to_run} .
RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["./wait-for-it.sh", "service:3000", "--", "npm", "run", "test"]
