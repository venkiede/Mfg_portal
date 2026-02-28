# Compliance Download Bundle – 401 Fix

## 1. Root Cause Explanation

**Why 401 occurred:**

1. **Wrong user ID passed**: The Compliance page called `downloadProjectBundle('COMPLIANCE', 'Admin')`. The second argument was sent as `X-User-Id`. The backend `get_current_user` looks up users by `id` in `users.json` (e.g. `"u1"`, `"u2"`). `"Admin"` is a role, not an ID, so the lookup failed and returned 401 "Invalid User".

2. **Wrong endpoint**: `downloadProjectBundle` targets `/download/project/{project_id}` and expects a numeric project ID. The Compliance page needs a compliance-specific download, not a project bundle.

3. **No AuthContext**: The Compliance page did not use `AuthContext`, so it had no access to the logged-in user and could not send a valid `X-User-Id`.

---

## 2. Backend Fix (FastAPI Route)

**New route: `GET /api/download/compliance`**

```python
@router.get("/compliance")
def download_compliance_bundle(current_user: User = Depends(get_current_user)):
    """Download compliance/certification data as ZIP. Requires X-User-Id header."""
    quality_file = os.path.join(DATA_DIR, "quality_management.json")
    if not os.path.exists(quality_file):
        raise HTTPException(status_code=404, detail="Compliance data not found")
    with open(quality_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    certifications = [d for d in data if isinstance(d, dict) and d.get("type") == "Certification"]
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr("compliance_register.json", json.dumps(certifications, indent=2))
        zip_file.writestr("compliance_summary.txt", f"Compliance Bundle\nExported by: {current_user.name}\nRecords: {len(certifications)}\n")
    zip_buffer.seek(0)
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="compliance_bundle.zip"'},
    )
```

- Uses `Depends(get_current_user)` → requires `X-User-Id` header.
- Returns ZIP with `Content-Type: application/zip` and `Content-Disposition: attachment`.

---

## 3. Frontend Fix (React + Axios)

**Compliance.js – use AuthContext and call the new endpoint**

```jsx
import { useContext } from "react";
import { AuthContext } from '../context/AuthContext';

const Compliance = () => {
    const { user } = useContext(AuthContext);
    const [downloadError, setDownloadError] = useState(null);

    const handleDownload = async () => {
        setDownloadError(null);
        if (!user?.id) {
            setDownloadError('Please log in to download.');
            return;
        }
        try {
            await dataService.downloadComplianceBundle(user.id);
        } catch (err) {
            setDownloadError(err.message || 'Download failed');
        }
    };
    // ...
};
```

**dataService.js – new compliance download**

```javascript
downloadComplianceBundle: async (userId) => {
  const res = await axiosInstance.get('/download/compliance', {
    headers: { 'X-User-Id': userId },
    responseType: 'blob',
  });
  const blob = res.data;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compliance_bundle.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
},
```

---

## 4. CORS Configuration (Already Correct)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

`allow_headers=["*"]` allows `X-User-Id` and other custom headers.

---

## 5. Final Verification Checklist

- [ ] User is logged in (Admin → Login if needed)
- [ ] Go to Admin → Project Module → Compliance
- [ ] Click "Download Bundle"
- [ ] `compliance_bundle.zip` downloads without 401
- [ ] No error or crash in the UI
- [ ] If not logged in, a clear message is shown instead of 401
