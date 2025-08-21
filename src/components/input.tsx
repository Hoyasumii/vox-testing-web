"use client";

import { useRef, useState } from "react";

type Props = {
	name: string;
};

export function Input({ name }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
  const [hasContent, setHasContent] = useState<boolean>(false);

	const inputHasContent = () => {
    const contentHasLength = inputRef.current.value.length > 0;

    setHasContent(contentHasLength);
	};

	return (
		<div className="relative w-full">
			<input
				ref={inputRef}
				type="text"
				id={name}
				className="px-2 py-1 peer rounded border border-slate-200 outline-0 transition-all duration-300 hover:border-emerald-200 focus:border-emerald-400 w-full"
				autoComplete="off"
        onChange={inputHasContent}
			/>
			<label
				data-has-content={hasContent}
				htmlFor="name"
				className="absolute top-1/2 -translate-y-1/2 bg-white left-2 peer-focus:-top-0.5 data-[has-content=true]:-top-0.5 transition-all duration-300"
			>
				{name}
			</label>
		</div>
	);
}
