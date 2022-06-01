table: users

email: VARCHAR(255)
username: VARCHAR(255)
password: VARCHAR(255)

sequelize model:create --name user --attributes email:string,username:string,password:string


table: pets

name: VARCHAR(255)
breed: VARCHAR(255)
age: VARCHAR(255)
url: VARCHAR(255)

sequelize model:create --name pet --attributes name:string,breed:string,age:string,size:string,url:string,tags:string

table: comments 

content: VARCHAR(255)
userId: INTEGER
petId: INTEGER

sequelize model:create --name comment --attributes content:string,userId:integer

table: favorites

action: VARCHAR(255)
userId: INTEGER
petId: INTEGER

sequelize model:create --name favorite --attributes action:string,userId:integer,petId:integer

table: pets_users

userId: INTEGER
petId: INTEGER

sequelize model:create --name pet_user --attributes userId:integer,petId:integer

sequelize db:migrate