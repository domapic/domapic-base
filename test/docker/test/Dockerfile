# Use an official Nodejs runtime as a parent image
FROM node:8.9.4

ARG test_to_run
ENV test_to_run=$test_to_run

# Set the working directory
WORKDIR /test

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer installs, work.

RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

# Copy the test contents into the container
ADD ./wait-for-it.sh .
ADD ./integration .
ADD ./end-to-end .

RUN ["chmod", "+x", "wait-for-it.sh"]

# Start service
CMD ["sh", "-c", "./wait-for-it.sh service:3000 -- ./node_modules/.bin/_mocha -- ${test_to_run}"]
