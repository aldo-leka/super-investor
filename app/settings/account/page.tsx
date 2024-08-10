import AccountSettings from "@/app/ui/account-settings";
import { getCurrentUser } from "@/app/lib/session";

export default async function AccountSettingsPage() {
    const user = await getCurrentUser();
    return (
        <main>
            <AccountSettings />
        </main>
    );
}
