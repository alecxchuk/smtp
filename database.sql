let insertUser = (email, password, name,address) => INSERT INTO users(user_name,user_email,user_password,user_address) VALUES (name,email,password,address);

const results = await db.query(
      "INSERT INTO restaurants (name,location,price_range) values($1,$2,$3) returning *",
      [req.body.name, req.body.locatin, req.body.price_range]
    );
