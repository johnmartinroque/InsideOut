import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ----------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

ELDERLY_ID = "QV6m7zrKxSP4PnMjcVab"

# ---------------- FETCH COMPANIONS BY ELDERLYID ----------------
def fetch_companions_for_elderly(elderly_id):
    companions_ref = db.collection("companion")  # your collection name
    query = companions_ref.where("elderlyID", "==", elderly_id)
    docs = query.stream()

    companions = []

    for doc in docs:
        data = doc.to_dict()
        data["docID"] = doc.id  # include document ID
        companions.append(data)

    return companions


# ---------------- RUN ----------------
if __name__ == "__main__":
    companions = fetch_companions_for_elderly(ELDERLY_ID)

    print(f"\n📋 Companions for ElderlyID {ELDERLY_ID}:\n")

    if not companions:
        print("No companions found.")
    else:
        for c in companions:
            print("----------------------")
            print("Doc ID:", c["docID"])
            print("CompanionID:", c.get("companionID"))
            print("Phone Number:", c.get("phoneNumber"))
            print("Email:", c.get("email"))
            print("CreatedAt:", c.get("createdAt"))

    print("\n✅ Fetch complete")