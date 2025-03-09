import { signIn, signOut, useSession } from "next-auth/react";

export default function Auth() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <div>
          <p>Bienvenue, {session.user.name}!</p>
          <img src={session.user.image} alt="Avatar" width={50} />
          <button onClick={() => signOut()}>Se déconnecter</button>
        </div>
      ) : (
        <button onClick={() => signIn("google")}>
          Se connecter avec Google
        </button>
      )}
    </div>
  );
}
