# Organization Service

Implement a simple microservice that manages the data of
multiple organization entities.

## Data model

```
organization = {
    organizationId: <generated uuid>,
    name: <string>,
    location: <string>,
    policyId: <string>
}
```

NoSQL: Map-key approach (Redis/Dynamo)

## Quick start

```
npm start
```

## API
#### List all organizations

```
> GET /organizations

< HTTP/1.1 200 OK
< Content-Type: application/json
< { data: [
    organizationId1,
    organizationId2]
    }
```

#### List an specific organization

```
> GET /organizations/1

< HTTP/1.1 200 OK
< Content-Type: application/json
< { data:
    {"organizationId": 1,
    "name":"stub Organization",
    "location":"Hamburg",
    "policyId":"12345"},
    }
```

#### Create a new organization

```
> POST /organizations/ -D {"name":"stub Organization",
                       "location":"Hamburg",
                       "policyId":"12345"}
                       }

< HTTP/1.1 201 OK
< Content-Type: application/json
< { data:
    {"organizationId": 1,
    "name":"stub Organization",
    "location":"Hamburg",
    "policyId":"12345"},
    }
```

#### Create multiple new organizations

This triggers a transaction (either all organizations are created or none of them).

```
> POST /organizations/ -D [{"name":"BWM",
                       "location":"Hamburg",
                       "policyId":"12345"}
                       }, {"name":"Mercedes",
                           "location":"Hamburg",
                           "policyId":"12345"}
                       }]

< HTTP/1.1 201 OK
< Content-Type: application/json
< { data:
    [{"organizationId": 1
      "name":"BWM",
      "location":"Hamburg",
      "policyId":"12345"}
   }, {
       "organizationId": 2
       "name":"Mercedes",
       "location":"Hamburg",
       "policyId":"12345"}
   }]
```

#### Delete an specific organization

```
> DELETE /organizations/1

< HTTP/1.1 200 OK
< Content-Type: application/json
< { data:
    {"organizationId": 1,
    "name":"stub Organization",
    "location":"Hamburg",
    "policyId":"12345"},
    }
```

#### Delete multiple organizations

This triggers a transaction (either all organizations are created or none of them).

```
> DELETE /organizations/ -D [
                        {"organizationId": 1 },
                        {"organizationId": 2 }]

< HTTP/1.1 200 OK
< Content-Type: application/json
< { data:
    [
    organizationId1,
    organizationId2]
```
