import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- FETCH COMPANIONS ----------------
def fetch_companions():
    companions_ref = db.collection("companion")
    docs = companions_ref.stream()

    companions = []

    for doc in docs:
        data = doc.to_dict()
        data["docID"] = doc.id  # include document ID
        companions.append(data)

    return companions


# ---------------- RUN ----------------
if __name__ == "__main__":
    companions = fetch_companions()

    print("\n📋 Companion List:\n")

    if not companions:
        print("No companions found.")
    else:
        for c in companions:
            print("----------------------")
            print("Doc ID:", c["docID"])
            print("CompanionID:", c.get("companionID"))
            print("Email:", c.get("email"))
            print("ElderlyID:", c.get("elderlyID"))
            print("CreatedAt:", c.get("createdAt"))

    print("\n✅ Fetch complete")
