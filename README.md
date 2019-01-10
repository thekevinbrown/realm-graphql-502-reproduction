# Realm GraphQL 502 Reproduction

1. Clone this repository and run `npm i`.
2. Copy `.env.example` to `.env`
3. Create a new instance in Realm Cloud and add its hostname to `.env`.
4. Add an admin user to the instance using Realm Studio and add the username and password to `.env`.
5. Delete the default realm, as it's a query based sync realm and we want a full sync realm.
6. Run `npm start`.

## Expected Result

Query should successfully return a result and the printout at the end of the script should say:

```
Result status: 200
```

Also, the request should complete quickly.

## Actual Result

Very long pause, then:

```
Unhandled error { Error: Request failed with status code 502
 <etc>
```
