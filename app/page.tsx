import { auth } from "@/auth";
import { AuthButtons } from "@/components/AuthButtons";
import { ReportManager } from "@/components/ReportManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
	const session = await auth();

	if (!session) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<Card className="w-full max-w-sm">
					<CardHeader>
						<CardTitle className="text-center">
							Welcome to Daily Report
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-4">
						<p className="text-sm text-muted-foreground">
							Please sign in to continue.
						</p>
						<AuthButtons />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<header className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Daily Report</h1>
				<AuthButtons />
			</header>
			<ReportManager />
		</div>
	);
}
