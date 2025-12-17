"use client";

import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "@/store/slices/counterSlice";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Permission, Role } from "@/types/dataUser";

export default function Schemantic() {
  const dispatch = useDispatch();

  const count = useSelector((state: RootState) => state.counter.value);
  const user = useSelector((state: RootState) => state.user.user);
  const component = useSelector(
    (state: RootState) => state.component.component
  );

  console.log("User Roles:", user?.roles);

  return (
    <div className="p-4">
      <h1 className="text-xl">Count: {count}</h1>

      <Button onClick={() => dispatch(increment())} className="mr-2">
        +
      </Button>
      <Button onClick={() => dispatch(decrement())} className="mr-2">
        -
      </Button>

      <h2 className="text-xl mt-4">User Info:</h2>
      <h2>User Name: {user?.username}</h2>

      {/* --- Roles --- */}
      <h2 className="mt-2 font-semibold">Roles:</h2>
      <div className="flex gap-2 flex-wrap">
        {user?.roles.length ? (
          user.roles.map((role: Role) => (
            <span
              key={role.id}
              className="px-2 py-1 text-sm bg-gray-200 rounded dark:bg-gray-700"
            >
              {role.name}
            </span>
          ))
        ) : (
          <span className="text-gray-500">No roles</span>
        )}
      </div>

      {/* --- Permissions --- */}
      <h2 className="mt-2 font-semibold">Permissions:</h2>
      <div className="flex gap-2 flex-wrap">
        {user?.roles.flatMap((role: Role) => role.permissions).length ? (
          user?.roles.flatMap((role: Role) =>
            role.permissions.map((p: Permission) => (
              <span
                key={p.id}
                className="px-2 py-1 text-xs bg-blue-200 rounded dark:bg-blue-700"
              >
                {p.name}
              </span>
            ))
          )
        ) : (
          <span className="text-gray-500">No permissions</span>
        )}
      </div>

      <h2 className="mt-4">Count: {count}</h2>
      <h2>Component Name Data: {component?.name}</h2>
    </div>
  );
}
