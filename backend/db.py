import os
import json
from typing import Dict, Any, Optional, List
from pymongo import MongoClient
from backend.config import settings

class Database:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        self.json_file = os.path.join(os.path.dirname(__file__), "local_db.json")
        self._init_db()

    def _init_db(self):
        try:
            self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
            self.client.server_info() # trigger exception if not connected
            self.db = self.client[settings.DB_NAME]
            self.use_mongo = True
            print("Successfully connected to MongoDB database.")
        except Exception as e:
            print(f"MongoDB not available ({e}). Using JSON file fallback store at {self.json_file}.")
            self.use_mongo = False
            if not os.path.exists(self.json_file):
                with open(self.json_file, "w") as f:
                    json.dump({"users": {}, "profiles": {}, "resumes": {}, "roadmaps": {}}, f, indent=2)

    def _read_local(self) -> Dict[str, Any]:
        if not os.path.exists(self.json_file):
            return {"users": {}, "profiles": {}, "resumes": {}, "roadmaps": {}}
        try:
            with open(self.json_file, "r") as f:
                return json.load(f)
        except Exception:
            return {"users": {}, "profiles": {}, "resumes": {}, "roadmaps": {}}

    def _write_local(self, data: Dict[str, Any]):
        with open(self.json_file, "w") as f:
            json.dump(data, f, indent=2)

    # User operations
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.use_mongo:
            try:
                return self.db.users.find_one({"email": email})
            except Exception:
                data = self._read_local()
                return data["users"].get(email)
        else:
            data = self._read_local()
            return data["users"].get(email)

    def save_user(self, user_doc: Dict[str, Any]):
        email = user_doc["email"].lower().strip()
        user_doc["email"] = email
        if self.use_mongo:
            try:
                self.db.users.update_one({"email": email}, {"$set": user_doc}, upsert=True)
            except Exception:
                data = self._read_local()
                data["users"][email] = user_doc
                self._write_local(data)
        else:
            data = self._read_local()
            data["users"][email] = user_doc
            self._write_local(data)

    # Profile & Prediction operations
    def save_student_profile(self, email: str, profile: Dict[str, Any], prediction: Dict[str, Any]):
        email = email.lower().strip()
        doc = {"email": email, "profile": profile, "prediction": prediction}
        if self.use_mongo:
            try:
                self.db.profiles.update_one({"email": email}, {"$set": doc}, upsert=True)
            except Exception:
                data = self._read_local()
                data["profiles"][email] = doc
                self._write_local(data)
        else:
            data = self._read_local()
            data["profiles"][email] = doc
            self._write_local(data)

    def get_student_profile(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.use_mongo:
            try:
                return self.db.profiles.find_one({"email": email})
            except Exception:
                data = self._read_local()
                return data["profiles"].get(email)
        else:
            data = self._read_local()
            return data["profiles"].get(email)

    # Resume operations
    def save_resume_analysis(self, email: str, analysis: Dict[str, Any]):
        email = email.lower().strip()
        doc = {"email": email, "analysis": analysis}
        if self.use_mongo:
            try:
                self.db.resumes.update_one({"email": email}, {"$set": doc}, upsert=True)
            except Exception:
                data = self._read_local()
                data["resumes"][email] = doc
                self._write_local(data)
        else:
            data = self._read_local()
            data["resumes"][email] = doc
            self._write_local(data)

    def get_resume_analysis(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.use_mongo:
            try:
                return self.db.resumes.find_one({"email": email})
            except Exception:
                data = self._read_local()
                return data["resumes"].get(email)
        else:
            data = self._read_local()
            return data["resumes"].get(email)

    # Roadmap operations
    def save_roadmap(self, email: str, roadmap: Dict[str, Any]):
        """Save the full roadmap (weeks). Preserves existing completed_tasks."""
        email = email.lower().strip()
        if self.use_mongo:
            try:
                existing = self.db.roadmaps.find_one({"email": email}) or {}
                existing_tasks = existing.get("roadmap", {}).get("completed_tasks", {})
                roadmap["completed_tasks"] = existing_tasks  # keep prior progress
                doc = {"email": email, "roadmap": roadmap}
                self.db.roadmaps.update_one({"email": email}, {"$set": doc}, upsert=True)
            except Exception:
                data = self._read_local()
                existing_tasks = data["roadmaps"].get(email, {}).get("roadmap", {}).get("completed_tasks", {})
                roadmap["completed_tasks"] = existing_tasks
                data["roadmaps"][email] = {"email": email, "roadmap": roadmap}
                self._write_local(data)
        else:
            data = self._read_local()
            existing_tasks = data["roadmaps"].get(email, {}).get("roadmap", {}).get("completed_tasks", {})
            roadmap["completed_tasks"] = existing_tasks
            data["roadmaps"][email] = {"email": email, "roadmap": roadmap}
            self._write_local(data)

    def save_roadmap_progress(self, email: str, completed_tasks: Dict[str, Any]):
        """Only update the completed_tasks field; never touch the weeks array."""
        email = email.lower().strip()
        if self.use_mongo:
            try:
                self.db.roadmaps.update_one(
                    {"email": email},
                    {"$set": {"roadmap.completed_tasks": completed_tasks}},
                    upsert=True
                )
            except Exception:
                data = self._read_local()
                entry = data["roadmaps"].get(email, {"email": email, "roadmap": {}})
                entry.setdefault("roadmap", {})["completed_tasks"] = completed_tasks
                data["roadmaps"][email] = entry
                self._write_local(data)
        else:
            data = self._read_local()
            entry = data["roadmaps"].get(email, {"email": email, "roadmap": {}})
            entry.setdefault("roadmap", {})["completed_tasks"] = completed_tasks
            data["roadmaps"][email] = entry
            self._write_local(data)

    def get_roadmap(self, email: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        if self.use_mongo:
            try:
                return self.db.roadmaps.find_one({"email": email})
            except Exception:
                data = self._read_local()
                return data["roadmaps"].get(email)
        else:
            data = self._read_local()
            return data["roadmaps"].get(email)

db = Database()
