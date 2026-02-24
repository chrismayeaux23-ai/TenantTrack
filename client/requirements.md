## Packages
qrcode.react | Generating unique QR codes for properties
date-fns | Formatting dates for maintenance requests
lucide-react | Beautiful icons for the UI
clsx | Conditional class names utility
tailwind-merge | Merging tailwind classes cleanly

## Notes
- Using Replit Auth for landlord login (`/api/login`, `/api/logout`, `/api/auth/user`).
- Using Replit Object Storage for tenant photo uploads (`/api/uploads/request-url` via provided `useUpload` hook).
- QR Codes link to `${window.location.origin}/report/${propertyId}`.
