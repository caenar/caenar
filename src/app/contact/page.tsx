"use client";

import React from "react";

export default function Contact() {
  return (
    <section className="content ">
      <div className="mb-20">
        <span className="page-title">/ Contact</span>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col gap-10">
          <h1 className="text-7xl font-bold mb-5">
            Why not <br /> say hello?
          </h1>
          <div>
            <h6 className="font-bold uppercase mb-3">
              Where I exist in the internet
            </h6>
            <ul className="grid gap-1">
              <li>
                <a
                  className="opacity-60 hover:opacity-100 transition"
                  href="facebook.com/bobo.o.ng.bulaklak"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  className="opacity-60 hover:opacity-100 transition"
                  href="telegram.com"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  className="opacity-60 hover:opacity-100 transition"
                  href="discord.com"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold uppercase mb-3">Direct Contact</h6>
            <ul>
              <li>
                <a className="opacity-60 hover:opacity-100 transition" href="">
                  +63 956 937 2583
                </a>
              </li>
              <li>
                <a
                  className="opacity-60 hover:opacity-100 transition"
                  href="mailto:kaiserlaconfiture@gmail.com"
                >
                  kaiserlaconfiture@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
          <form className="w-[900px]">
            <div className="form-input">
              <label htmlFor="name">Full name</label>
              <input type="text" placeholder="Juan Dela Cruz" />
            </div>
            <div className="form-input">
              <label htmlFor="name">Email address</label>
              <input type="email" placeholder="juan@gmail.com" />
            </div>
            <div className="form-input">
              <label htmlFor="message">Message</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Hello, Caenar!"
              ></textarea>
            </div>
            <button className="primary-button mt-5" type="submit">
              Send message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
