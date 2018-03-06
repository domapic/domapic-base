# Use an official Nodejs runtime as a parent image
FROM javierbrea/node-headless-chrome:1.0.0

ARG test_to_run
ENV test_to_run=$test_to_run

# Set the working directory
WORKDIR /test

# Copy the test contents into the container
ADD ./wait-for-it.sh .
ADD ./integration .
ADD ./end-to-end .

RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["sh", "-c", "./wait-for-it.sh service:3000 -- ./node_modules/.bin/_mocha -- ${test_to_run}"]
