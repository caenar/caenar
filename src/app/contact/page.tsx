"use client";

import React from "react";

export default function Contact() {
  return (
    <section className="content h-screen flex flex-col justify-between">
      <h5 className="page-title">/ Contact</h5>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-5 ">
            <h5 className="uppercase font-bold">Direct contact</h5>
            <div className="grid">
              <a>kaiserlaconfiture@gmail.com</a>
              <a>+63 956 937 2583</a>
            </div>
          </div>
          <div className="flex flex-col gap-5 ">
            <h5 className="uppercase font-bold">
              Where I exist in the Internet
            </h5>
            <div className="flex gap-7">
              <a>Github</a>
              <a>Facebook</a>
              <a>Linkedin</a>
            </div>
          </div>
        </div>
        <form className="w-[600px] flex flex-col">
          <h2 className="mb-10">Leave a message</h2>
          <div className="form-input">
            <label htmlFor="name">Name</label>
            <input type="text" placeholder="John Dela Cruz" />
          </div>
          <div className="form-input">
            <label htmlFor="email">Email address</label>
            <input type="text" name="email" placeholder="example@email.com" />
          </div>
          <div className="form-input">
            <label htmlFor="name">Message</label>
            <textarea
              name="message"
              rows={7}
              placeholder="What's on your mind?"
            ></textarea>
          </div>
          <button className="primary-button mt-7 self-end">Send message</button>
        </form>
      </div>
    </section>
  );
}
