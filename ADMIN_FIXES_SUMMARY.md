# Admin Panel Fixes – Root Cause Analysis & Solutions

## 1. Root Cause Analysis

### Issue 1: Project Creation Auto-Creates Without Form
**Root Cause:** `handleCreateProject` was bound directly to the "New Project" button and immediately called `dataService.addProject()` with hardcoded values (`name: 'New Project'`, `manager: 'Manual entry'`, etc.). No modal or form was involved.

### Issue 2: Compliance → Export CSV Not Working
**Root Cause:** `handleExport` called `dataService.exportToCSV(records, 'compliance_register')`, but `exportToCSV` does not exist in `dataService`. This caused a runtime error when the button was clicked.

### Issue 3: Approval Center → "Method Not Allowed" (405)
**Root Cause:** Backend defines `PATCH` for `/api/admin/approvals/{id}` and `/api/admin/users/{id}`, while the frontend used `PUT`. HTTP 405 occurs when the requested method is not allowed for the resource.

---

## 2. Step-by-Step Debugging Strategy

### Issue 1
1. Inspect the "New Project" button handler.
2. Confirm whether it opens a modal or calls the API directly.
3. Add a modal with controlled form inputs.
4. Call the API only on form submit after validation.

### Issue 2
1. Check if `exportToCSV` exists in `dataService`.
2. Decide between client-side CSV generation or backend CSV endpoint.
3. Implement CSV generation and Blob-based download.

### Issue 3
1. Compare frontend HTTP method with backend route.
2. Use browser DevTools → Network to see the actual method and URL.
3. Align frontend method with backend (PATCH vs PUT).

---

## 3. Corrected React Code Snippets

### Issue 1: Project Creation Modal Form

```jsx
// Controlled form state
const [formData, setFormData] = useState({
  name: '',
  description: '',
  start_date: '',
  manager: '',
});
const [formErrors, setFormErrors] = useState({});

// Validation
const validateForm = () => {
  const err = {};
  if (!formData.name?.trim()) err.name = 'Project name is required';
  if (!formData.manager?.trim()) err.manager = 'Owner is required';
  if (!formData.start_date) err.start_date = 'Start date is required';
  setFormErrors(err);
  return Object.keys(err).length === 0;
};

// Submit handler – API called only here
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setSubmitting(true);
  try {
    const created = await dataService.addProject({
      name: formData.name.trim(),
      manager: formData.manager.trim(),
      status: 'On Track',
      progress: 0,
      due_date: formData.start_date,
    }, user?.id);
    setRecords(prev => [created, ...prev]);
    handleCloseModal();
  } catch (err) {
    setFormErrors({ submit: err.message });
  } finally {
    setSubmitting(false);
  }
};
```

### Issue 2: CSV Export (Client-Side Blob)

```javascript
// utils/csvExport.js
export function downloadCsv(data, filename = 'export', columns = null) {
  const csv = toCsvString(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// In Compliance.js
const handleExport = () => {
  try {
    const columns = ['title', 'standard', 'expiry_date', 'status', 'owner', 'issued_by'];
    downloadCsv(records, 'compliance_register', columns);
  } catch (err) {
    console.error('CSV export failed:', err);
  }
};
```

### Issue 3: Approval Center – PATCH Instead of PUT

```javascript
// dataService.js – use PATCH
updateApproval: async (id, payload, role) => {
  if (MODE === 'backend') {
    const res = await axiosInstance.patch(`/admin/approvals/${id}`, payload, {
      headers: { 'X-User-Role': role },
    });
    return res.data;
  }
  // ... local mode
},
```

---

## 4. Backend Fix Suggestions

### CSV Export Endpoint (FastAPI)

```python
@router.get("/export-csv/{module}")
def export_module_csv(module: str, x_user_role: str = Header(default="")):
    require_admin(x_user_role)
    data = _load(file_map[module])
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{module}.csv"'},
    )
```

### Approval Update – Use PATCH (Already Correct)

```python
@router.patch("/approvals/{approval_id}")
def update_approval(approval_id: str, payload: dict = Body(...), ...):
    # PATCH is RESTful for partial updates
```

---

## 5. Best Practices for API Integration

| Practice | Implementation |
|----------|----------------|
| Match HTTP methods | Use PATCH for partial updates, PUT for full replacement |
| Controlled components | `value={formData.x}` + `onChange` for all inputs |
| Validate before submit | Run validation in submit handler, block API call if invalid |
| Prevent default | `e.preventDefault()` in form `onSubmit` |
| Loading state | Disable submit button and show spinner during request |
| Error handling | Catch errors, show user-friendly messages |
| Success feedback | Toast or inline message after successful action |

---

## 6. Common Mistakes to Avoid

1. **Calling API on button click instead of form submit** – Use a modal form and call the API only on submit.
2. **Using PUT when backend expects PATCH** – Check backend route definitions and align the method.
3. **Missing `exportToCSV` or similar helpers** – Implement or import the function before using it.
4. **Forgetting `e.preventDefault()`** – Forms submit by default; prevent it to avoid page reload.
5. **Not revoking Blob URLs** – Call `URL.revokeObjectURL(url)` after download to avoid memory leaks.
6. **Wrong Content-Disposition** – Use `attachment; filename="..."` for file downloads.
