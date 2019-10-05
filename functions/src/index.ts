import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp();

exports.addAdmin = functions.https.onCall((data, context: any) => {
  
  /* Need to comment the below snippet to make atleast one user
    admin. Once one user has become admin then this code need 
    to be uncommented, so no one else can call it make themselves 
    admin

    Add checks in DB too
    
      Service cloud.firestore {
        match /databases/{database}/documents {

      Match /users/{userId} {
        allow create: if request.auth.uid != null;   //user can create first time without login 
        allow read: if request.auth.uid == userId;  //After that user can only read his her own document
       
        }
        

      match /posts/{postId} {
        allow read: if request.auth.uid != null ; //only logged in user can read
        allow write: if request.auth.token.admin == true ;   //only admin can write 
        }
        }
      }
    */
  
   if (context.auth.token.admin !== true) {
     return {
       error: "Request not authorized. User must be a admin to add moderator"
     };
  }

  const email = data.email;
  return grantModeratorRole(email).then(() => {
    return {
      result: ` Request fulfilled! ${email} is now a moderator`
    };
  });
});

async function grantModeratorRole(email: string): Promise<void> {
  const user = await admin.auth().getUserByEmail(email);
  if (user.customClaims && (user.customClaims as any).admin === true) {
    return ;
  }
  return admin.auth().setCustomUserClaims(user.uid, {
    admin: true
  });
}
