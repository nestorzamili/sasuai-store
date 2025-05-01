interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex-1 container grid items-center justify-center lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <div className="mb-4 flex flex-col items-center justify-center">
          <img
            src="https://res.cloudinary.com/samunu/image/upload/f_auto/q_auto/v1745953012/icon_z07a9i.png"
            alt="Sasuai Store"
            className="mb-3 h-16 w-16 object-contain"
          />
          <h1 className="text-xl font-medium">Sasuai Store</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
