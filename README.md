# CRUDe-boy

A nodeJS mongoDb CRUD helper. Give it a model and you're good to go.

## Motivation

Basically tries to recreate a Django Rest Framework Viewset. Express is a great tool, but can get quite repetitive and requires a bunch of code to get one simple thing going: a CRUD endpoint. CRUDe-boy aims at easing this process. It gives you 4 handy controllers, one per HTTP method (GET, PUT, POST, DELETE)

## How to use?

Simply download it from npm

```
npm i crude-boy
```

Then you can use it in your app. You first specify a mongodb model then pass it to the consructor as well as a name. This name is used for sending personnalized response messages.

```javascript
// inits the user controller
const userController = new CRUDController(UserModel, 'user');

/**
 * You can then use as in regular express as many
 * middleware as you want to verify auth, params 
 * sent etc.
 * 
 * ! note that you have to specify :id? as an optionnal * param 
 */ 
app
  .route('/users/:id?')
  .delete(verifyToken, verifyAuth, userController.deleteController)
  .get(verifyToken, verifyAuth, userController.getController)
  .put(verifyToken, verifyAuth, userController.putController);
```

## What it can do

Method | endpoint params (route + ...) | Params |Results
--- | --- | --- | ---
GET | / | `null` | Retreives all the data
GET | / | `offset, limit` in query params | Retreives all the data using offset/limit pagination
GET | / | `id` in query params | Retreives the item with the given id
GET | /id | `null` | Retreives the item with the given id
GET | / | `ids` in query params | Retreives all the items with the specified ids
--- | --- | --- | ---
POST | / | `data` as an object of required data in body | Creates an element of this entity
POST | / | `data` as an array of objects specifing required data in body | Creates all the elements specified
--- | --- | --- | ---
DELETE | / | `id` in query params | Deletes the item with the given id
DELETE | / | `ids` in query params, comma separated | Deletes all the specified items
DELETE | /id | `null` | Deletes the item with the given id
--- | --- | --- | ---
PUT | /id | `data` in body | Modifies the item with the given id using the data in body
PUT | / | `data` & `id` in body | Modifies the item with the given id using the data in body
PUT | / | `data` & `ids` in body | Modifies the items with the given ids using the data in body

## Contributing

See the [CONTRIBUTING](./CONTRIBUTING.MD) document

## License

See the [LICENSE](./LICENSE) document
