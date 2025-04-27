# AWS Demo App

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [IAM Setup](#iam-setup)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
  - [1. Create Frontend and Backend](#1-create-frontend-and-backend)
  - [2. Set Up S3 Bucket for Frontend Hosting](#2-set-up-s3-bucket-for-frontend-hosting)
  - [3. Add CloudFront for HTTPS](#3-add-cloudfront-for-https)
  - [4. Create S3 Bucket for File Storage](#4-create-s3-bucket-for-file-storage)
  - [5. Set Up AWS SES and Lambda for Email Notifications](#5-set-up-aws-ses-and-lambda-for-email-notifications)
  - [6. Develop Backend APIs](#6-develop-backend-apis)
  - [7. Launch EC2 Instance for Backend](#7-launch-ec2-instance-for-backend)
  - [8. Deploy Backend to EC2](#8-deploy-backend-to-ec2)
  - [9. Install PM2 to Keep Backend Running](#9-install-pm2-to-keep-backend-running)
  - [10. Automate the Frontend Building](#10-automate-the-frontend-building)
- [Conclusion](#conclusion)

## Project Overview
This project builds a cloud application consisting of:
- A frontend hosted on AWS S3 + CloudFront (static hosting with HTTPS)
- A backend (Node.js Express server) deployed on an AWS EC2 instance
- Integration with AWS S3 APIs to upload, list, and delete files
- Integration with AWS SES and AWS Lambda to send email notifications automatically when new files are uploaded

## Architecture
- Frontend: Static Hosting on S3
- CDN: CloudFront for HTTPS and caching
- Backend: Node.js/Express API on EC2
- Storage: S3 buckets for file uploads
- Email Notifications: AWS Lambda + AWS SES
- Frontend Automation: Automate the building process using Github Actions

## Technologies Used
- AWS EC2
- AWS S3
- AWS CloudFront
- AWS IAM 
- AWS SES 
- AWS Lambda
- React.js
- Node.js
- Express.js
- PM2
- GitHub Actions

## IAM Setup
- **Create an IAM User for S3 Access**:
  - Create a user with programmatic access.
  - Attach a policy that grants access to the specific S3 buckets.
  - Save the Access Key ID and Secret Access Key for backend `.env` file.

- **Create an IAM Role for EC2**:
  - Create a new role with **EC2** as the trusted entity.
  - Attach policies for S3 and SES access.

## Step-by-Step Setup Guide

### 1. Create Frontend and Backend
- Frontend:
  - Static website using React.js, HTML, CSS, and JavaScript
- Backend:
  - Node.js Express server
  - `.env` file to store sensitive credentials

Important: Add `.env` to `.gitignore`.

### 2. Set Up S3 Bucket for Frontend Hosting
- Create an S3 bucket.
- Disable "Block All Public Access".
- Enable Static Website Hosting.
- Upload frontend build files.

Example bucket policy for allowing any S3 action:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicReadAccess",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::bucket-name/*"
        }
    ]
}
```

### 3. Add CloudFront for HTTPS
- Create a CloudFront Distribution:
  - Origin Domain: S3 website endpoint
  - Viewer Protocol Policy: Redirect HTTP to HTTPS
  - Default Root Object: `index.html`

### 4. Create S3 Bucket for File Storage
- Create an S3 bucket for user file uploads.
- Configure permissions carefully.

### 5. Set Up AWS SES and Lambda for Email Notifications
- Go to AWS SES:
  - Verify sender email.
  - (Optional) Verify domain.
  - Request production access if needed.
  - Test AWS SES using a custom receiver (used my personal email address).

- Create a Lambda function:
  - Triggered by the S3 upload event.
  - Sends email via AWS SES.

Example Lambda function:
```javascript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const handler = async (event) => {
  // Set the region
  const ses = new SESClient({ region: "INSERT_REGION" });

  const fromAddress = "FROM_ADDRESS";
  const toAddress = "TO_ADDRESS";

  // Create sendEmail params
  var params = {
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<h1>A new file was uploaded</h1><p>This was sent from the HTML.</p>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "A new file was uploaded.",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Upload File",
      },
    },
    Source: fromAddress
  };

  const command = new SendEmailCommand(params);

  try {
    await ses.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify('Email sent successfully to ' + toAddress + ' from ' + fromAddress)
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify('Failed to send email')
    };
  }
};
```

### 6. Develop Backend APIs
- Create Express endpoints:
  - **Upload File API**
  - **List Files API**
  - **Delete File API**
  
- Connect to AWS S3 using the AWS SDK.

### 7. Launch EC2 Instance for Backend
- Launch EC2 instance:
  - **AMI**: Ubuntu Server 22.04 LTS (or latest stable version)
  - **Instance Type**: t2.micro (Free Tier eligible)
  - **Storage**: 8 GiB (General Purpose SSD (gp2))
  - **Key Pair**: Create a new RSA `.pem` key
 
- Attach IAM role with S3 and SES permissions.
- Configure Security Group:
    - Allow SSH on port 22 from your IP (or any IP for simplification)
    - Custom TCP on port 5000 for backend API access
- **Additional:** Use Elastic IP to allocate and associate to keep a static public IP

### 8. Deploy Backend to EC2
- SSH into EC2
- Install Node.js, npm, and Git.
- Clone project repo.
- Upload `.env` file using `scp` from your local machine:
  ```bash
  scp -i your-key-name.pem full/path/to/.env ubuntu@your-ec2-public-ip:/home/ubuntu/your-repo-name/
  ```

- In summary, run:
  ```bash
  chmod 400 your-key-name.pem
  ssh -i path/to/key.pem ubuntu@your-ec2-public-ip
  sudo apt update
  sudo apt upgrade -y
  sudo apt install git -y
  sudo apt install npm
  sudo apt install nodejs
  git clone https://github.com/your-username/your-repo-name.git
  cd your-repo-name
  npm install
  node server.js
  ```


### 9. Install PM2 to Keep Backend Running
- Install PM2:
```bash
sudo npm install -g pm2
```
- Start and save PM2 processes:
```bash
pm2 start server.js
```

### 10. Automate the Frontend Building

To automate the deployment of the frontend, a GitHub Actions CI/CD pipeline is set up.

Every time you push code to the `main` branch of your GitHub repository:
- The project is automatically built (React production build)
- The updated build files are uploaded to the S3 bucket
- The new version is served immediately through CloudFront

This removes the need to manually rebuild and re-upload the frontend every time a change is made.

#### GitHub Actions Setup

Create a workflow file at `.github/workflows/aws-deployment.yml` inside your repository.

Example `aws-deployment.yml` configuration:

```yaml
name: Deploy React App on AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:

    # Checkout Code:
    # This step is for the workflow to be able to access the files of the last push
    - name: Checkout
      uses: actions/checkout@v4

    # Install Node:
    # We need this to run npm install and npm run build
    - name: Setup Node.js environment
      uses: actions/setup-node@v4.4.0
      with:
        node-version: ${{ secrets.NODE_VERSION }}

    - name: Install Dependencies
      run: npm install

    - name: Build the App
      run: npm run build

    - name: Configure AWS Credentials
      uses: aws-actions/configure-aws-credentials@v4.1.0
      with:
        aws-region: eu-west-3
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Deploy to AWS S3
      run: aws s3 sync build/ s3://claras-personal-portfolio --delete
```

You will need to upload all the necessary secrets to your GitHub Actions.


## Conclusion
You have:
- Built a full-stack cloud app
- Hosted frontend on S3 + CloudFront with HTTPS
- Deployed backend on EC2
- Automated email notifications using Lambda + SES
- Used PM2 for backend resilience