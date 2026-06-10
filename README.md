
# ChessReview

ChessReview is a platform that helps chess players analyze their games, identify mistakes, and improve their skills through detailed game reviews.


###
![App Screenshot](https://dummyimage.com/468x300?text=App+Screenshot+Here)


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
