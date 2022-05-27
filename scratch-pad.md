table: users

email: VARCHAR(255)
username: VARCHAR(255)
password: VARCHAR(255)

sequelize model:create --name user --attributes email:string,username:string,password:string

sequelize db:migrate



table: comments 

comment: VARCHAR(255)


