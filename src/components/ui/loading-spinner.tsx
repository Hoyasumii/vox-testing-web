"use client";
export function LoadingSpinner({ size = 32 }: { size?: number }) {
	return (
		<div
			aria-busy="true"
			className="animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
			style={{ width: size, height: size }}
		/>
	);
}
