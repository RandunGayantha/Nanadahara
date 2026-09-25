// Firebase Admin SDK service account credentials, embedded directly (this is
// a private repo, an explicit choice — see project history) so the /api
// functions work on Vercel without depending on vercel.json's env/build.env
// mechanism actually reaching Serverless Functions at runtime, which turned
// out to be unreliable. `getAdmin()` in ./firebaseAdmin.js still prefers real
// FIREBASE_* environment variables when they're set, and only falls back to
// this file otherwise — so switching to dashboard-managed env vars later
// needs no code change.
export default {
  projectId: 'nanadahara-tuition',
  clientEmail: 'firebase-adminsdk-fbsvc@nanadahara-tuition.iam.gserviceaccount.com',
  privateKey:
    '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQClhpoNY7wQ7pye\niA45KspViJ33d75CO3+I4aUSydAOJWpllLJXXOgSIF/RfDYUQVkEtL300I+F1tjD\ndOdBhxjglUFozeGYjBe933DAA1HlM7R6RQk9kTOgvinSFBsQeRd0igHFp1r/oHei\nNZAXhTYcw/jzADcgjTXGJmCL2zRz+c7/E24QQtwYqAWNicNveqawbhyFt/YR0DMv\nnVb/qYE1vjD/ReoH2/Vjjt637ERvK7bFeuKc7qxvDgWaA+qsvTXvjmZjNjN0pbow\n++lw8fDYy21lf1gDf0gdKpOBtYYjj9adAR5XnuXTqk1OtCSrubnKlahJqUBx5YBE\naXH4ixsrAgMBAAECggEABNTCiCXw+sE/ibJoviaK7bCXlpA7WbQ9kePThBKCjNO4\nBXkdfWsgjErjvsL9iV1g5tJ5pkXGoFCcVpQUHdL+qz2pHLWb4jeQh9Q8dpGmzuX2\nN7+lE5ze82Ipe5mLDhr09IK7gl2JuiwgmJxUmfDaUa3lu/3si7C+1YtZWHTHMFsH\nWsG8+OTHhH10o3gZtyuMG3VV7hbRCt1sbYLUdEiFm0zzRtjgPzpvJXl8q8tCeFOe\ng0BZMOgbel+/cyXRmwsY8pqUk2jbR+1Zr444QMxMvfVEfTcNE+iltF6ZQdBnN5hA\n/8GGwuWtciEWZEBP0fNW+ylmRuBzgIRyGg0Y5mthnQKBgQDXcfZQjhZDVJLTj26H\n6A5cs/fgapAT760FB79q5x6vUKbI0hCJQnOsekRVybPiiWaL3whZ+s0dkudb+vHe\nrpvXz7kQABr4fYU2cQsM9yom9nc65gB7ARHD/sJQR/IpaOt8VTB8vvNqzpVlImCG\nMc8ISNI9uNEhG7igCmBPGQYnXwKBgQDErxYO5xdd7ZDo3ujgN2uyikm/yrdFb0UW\ndNOS3ovsqD7lu4Xbu8j/jXYvKlJtD7JgIvNNKpXAvE5XBSlArPqzJAkvO1jRObZK\nev/KW44XHH+iWWUIL8SlvPP67+SMpvtESELIGocgdSyyw/IGFnR/GSXoqO7S6SnD\nORAJCl3btQKBgQC9pwFYWiu464swlxOKqbly2635rHTWR+b8BZz4Yym81HdtUpXh\n7lBbZWogRqWGZsORnyz/4GqNfRMTAi3Gg9iGOsJDFoSnd/87NHmw2ScPE2lTvMJx\nhTh5Wxr8hsjisQyS7372YTVwMRiL5Z4oo1IHjesdEENwLLHymA+9sV6cawKBgQCV\n9air1CZMx0UlSE/mJFtI1YdFZBo4Jo5WgNyPrn6hAeZy4nc9AgBOWF0zuOD/pmgq\nRHuc6ksjmG9iidzaIwlCbMdT67vcSlRilUVR1FyR4niuH9qYU1NrypV7TkzDsM0D\nUtUYHKHKbYyXAC8X1ScdgN8WdTciOARPhMJlIjJNwQKBgQCWmJRZWDSmZaKm+QzO\n+jmqtmQjmC0Np0oVDslEiM82t8W0To6mhNxOMf4kM0yLrxFjv5QSz3AeFezgil1A\nZQy6hC1CWT66+lqoCX8YQyo/xr3i8QRb4dci/cyFwqFDKYagXhOsRJUrCr8dxSgO\nvU1R3PyiealOEZvU2muVYpUrcA==\n-----END PRIVATE KEY-----\n',
}
