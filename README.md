# ChessReview

ChessReview is a platform that helps chess players analyze their games, identify mistakes, and improve their skills through detailed game reviews.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next.js](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)


###
<img width="1469" height="831" alt="Captura de Tela 2026-06-10 às 09 03 16" src="https://github.com/user-attachments/assets/278eab01-e871-4a7b-b5d0-3d4b22e1ed1d" />



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`LICHESS_TOKEN` Lichess API token on [Lichess](https://lichess.org/account/oauth/token/create) website.


## Run Locally

Clone the project:

```bash
  git clone https://github.com/suuukii/chessreview.git
```

Go to the project directory:

```bash
  cd chessreview
```

Then run the following command:
```bash
  docker-compose up -d
```

The standard port is 3000 but you can change:
```bash
  PORT=8000 docker-compose up
```
