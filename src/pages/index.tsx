import {PageConfig} from 'next';

export const config: PageConfig = {
	unstable_runtimeJS: false,
};

export default function Home() {
	return <>{Date.now()}</>;
}
