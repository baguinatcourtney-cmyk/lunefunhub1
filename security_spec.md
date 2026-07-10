# Security Specification: Luneville Board & User Notifications

## 1. Data Invariants
- **Coins Balance Security**: No user can modify another user's coin balance or profile.
- **Maximum Post Length**: Board posts, poll options, and replies must never exceed 400 characters.
- **Poll Expiry (9 Days)**: Polls have a hardcoded 9 days deadline from creation, after which no further votes are registered.
- **Notification Privacy**: Notifications are private and readable only by the recipient (`/users/{userId}/notifications`).
- **Identity Honesty**: The `authorId` or `senderId` in posts, replies, and notifications must match the actual authenticated User ID (`request.auth.uid`).

## 2. The "Dirty Dozen" Malicious Payloads
1. **Coin Theft**: Payload attempting to modify another user's `coins` field in `/users/attacker_id` profile.
2. **Post Spoofing**: Creating a board post where `authorId` is set to a victim's user ID.
3. **Over-sized Post**: Creating a post containing a 10,000-character string to exhaust database space.
4. **Illegal Vote Mod**: Modifying non-poll fields (like `content` or `authorName`) during a vote transaction.
5. **Post-Deadline Vote**: Attempting to increment poll options after the 9-day expiration timestamp has passed.
6. **Reply Spoofing**: Creating a reply where `authorId` is set to someone else.
7. **Junk ID Poisoning**: Trying to create a post with a 2MB base64 string as the document ID.
8. **PII Blanket Leak**: Querying the entire users collection for emails or coins.
9. **Notification Eavesdropping**: Trying to read notifications from another user's `/users/victim_id/notifications` subcollection.
10. **System Notification Forgery**: Creating a system notification that spoofs official results without being logged in.
11. **Malicious Poll Creation**: Creating a poll with 100 options or negative vote totals.
12. **Deleted Post Bypass**: Trying to delete a post created by another user.

## 3. Security Assertions & Rules Tests
All of the above payloads will be rejected with `PERMISSION_DENIED` by the security rules enforced in `firestore.rules`.
