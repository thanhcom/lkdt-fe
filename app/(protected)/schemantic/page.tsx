"use client";

import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "@/store/slices/counterSlice";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

export default function Schemantic() {
  const dispatch = useDispatch();
  const count = useSelector((state: RootState) => state.counter.value);
  const user = useSelector((state: RootState) => state.user.user)

  return (
    <div className="p-4">
      <h1 className="text-xl">Count: {count}</h1>
      <Button onClick={() => dispatch(increment())} className="mr-2">+</Button>
      <Button onClick={() => dispatch(decrement())} className="mr-2">-</Button>
      <h2 className="text-xl mt-4">User Info:</h2>
      <h2>User Name  :{user?.username}</h2>
    </div>
  );
}
