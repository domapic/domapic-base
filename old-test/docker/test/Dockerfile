# Use an official Nodejs runtime as a parent image
FROM javierbrea/node-headless-chrome:1.0.0

# Set the working directory
WORKDIR /app

# Copy the test contents into the container
ADD ./wait-for-it.sh .

RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["sh", "-c", "./wait-for-it.sh service:3000 -- ./node_modules/.bin/_mocha -- --recursive test/test-to-run/specs"]
